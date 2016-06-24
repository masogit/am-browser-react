// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from './util/grommet-rest-promise';
//import history from './RouteHistory';
//import Query from 'grommet-index/utils/Query';
import cookies from 'js-cookie';
import * as Types from './constants/ActionTypes';

// session
export const INIT = 'INIT';
export const INIT_TOKEN = 'INIT_TOKEN';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS';

// route
export const ROUTE_CHANGED = 'ROUTE_CHANGED';

// nav
export const NAV_PEEK = 'NAV_PEEK';
export const NAV_ACTIVATE = 'NAV_ACTIVATE';
export const NAV_RESPONSIVE = 'NAV_RESPONSIVE';

// index page
export const INDEX_NAV = 'INDEX_NAV';
export const INDEX_LOAD = 'INDEX_LOAD';
export const INDEX_SELECT = 'INDEX_SELECT';
export const INDEX_QUERY = 'INDEX_QUERY';
export const INDEX_UNLOAD = 'INDEX_UNLOAD';

// item page
export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const ITEM_NEW = 'ITEM_NEW';
export const ITEM_ADD = 'ITEM_ADD';
export const ITEM_EDIT = 'ITEM_EDIT';
export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_REMOVE = 'ITEM_REMOVE';

// index api
export const INDEX_SUCCESS = 'INDEX_SUCCESS';
export const INDEX_AGGREGATE_SUCCESS = 'INDEX_AGGREGATE_SUCCESS';
export const ITEM_SUCCESS = 'ITEM_SUCCESS';
export const ITEM_FAILURE = 'ITEM_FAILURE';
export const ITEM_ADD_SUCCESS = 'ITEM_ADD_SUCCESS';
export const ITEM_ADD_FAILURE = 'ITEM_ADD_FAILURE';
export const ITEM_NOTIFICATIONS_SUCCESS = 'ITEM_NOTIFICATIONS_SUCCESS';
export const ITEM_NOTIFICATIONS_FAILURE = 'ITEM_NOTIFICATIONS_FAILURE';
export const ITEM_MAP_SUCCESS = 'ITEM_MAP_SUCCESS';
export const ITEM_MAP_FAILURE = 'ITEM_MAP_FAILURE';
export const METADATA_SUCCESS = 'METADATA_SUCCESS';
export const METADATA_DETAIL_SUCCESS = 'METADATA_DETAIL_SUCCESS';

export const TEMPLATE_LOAD_SUCCESS = 'TEMPLATE_LOAD_SUCCESS';
export const RECORD_LOAD_SUCCESS = 'RECORD_LOAD_SUCCESS';
export const DETAIL_RECORD_LOAD_SUCCESS = 'DETAIL_RECORD_LOAD_SUCCESS';

export function init(email, headerString) {
  try {
    const headerNavs = JSON.parse(headerString.substring(headerString.indexOf('{')));
    return {type: INIT, email, headerNavs};
  } catch (e) {
    return {type: INIT};
  }
}

export function initToken() {
  return Rest.get('/am/csrf').end((err, res) => {
    if (err || !res.ok) {
      console.log('Get CSRF failed');
      throw err;
    } else {
      console.log('CSRF: ' + cookies.get('csrf-token'));
    }
  });
}

export function initAbout() {
  return Rest.get('/am/about').then((res) => {
    return res.body;
  }, (err) => {
    console.log('Get About failed');
    throw err;
  });
}

export function login(username, password, retry) {
  return function (dispatch) {
    const auth = 'Basic ' + new Buffer(`${username}:${password}`).toString('base64');
    Rest.post('/am/login')
      .set("Authorization", auth)
      .end((err, res) => {
        if (err) {
          let message, retrying = false;
          if (err.status) {
            if (err.status == 500) {
              message = res.text.indexOf('ECONNREFUSED') ? 'Can not connect to rest server.' : res.text;
            } else if (err.status == 403 && res.text.indexOf('invalid csrf token') > -1) {
              message = 'Invalid csrf token';
              if (!retry) {
                login(username, password, true)(dispatch);
                retrying = true;
              }
            } else {
              message = 'Please contact administrator.';
            }
          } else {
            message = err.message.indexOf('network is offline') ? 'Can not connect to node server.' : err.message;
          }

          if (!retrying) {
            dispatch(loginFailure({message: 'Login failed. ' + message}));
          }
        } else if (res.ok) {
          if (res.body) {
            const headerNavs = res.body.headerNavs;
            cookies.set("user", username);
            dispatch(loginSuccess(username, headerNavs));
          } else {
            dispatch(loginFailure({message: res.text}));
          }
        }
      });
  };
}

export function logout() {
  return function (dispatch) {
    Rest.get('/am/logout').end((err, res) => {
      if (err) {
        dispatch({message: 'LogoutFailed'});
        throw err;
      } else if (res.ok && res.body) {
        dispatch({type: LOGOUT});
      }
    });
  };
}

export function sendMessageToSlack(messages) {
  return function (dispatch) {
    Rest.post('/slack', {messages}).then(res => {
      if (res.ok) {
        if (res.text) {
          dispatch({type: Types.RECEIVE_WARNING, msg: res.text});
        } else {
          dispatch({type: Types.RECEIVE_INFO, msg: `Message sent to Slack:"${messages}"`});
        }
      }
    }, err => {
      if (err && err.status == 500) {
        dispatch({
          type: Types.RECEIVE_WARNING,
          msg: 'Can not initialize rest client, please check your proxy setting.'
        });
      }
    });
  };
}

export function getConfigSuccess(headerNavs) {
  return {type: GET_SETTINGS_SUCCESS, headerNavs};
}

export function metadataLoad() {
  return function (dispatch) {
    Rest.get('/am/schema')
      .set('Content-Type', 'Application/json')
      .end(function (err, res) {
        if (!err) {
          let data = res.body;
          dispatch(metadataSuccess(data, []));
        }
      });
  };
}

export function metadataLoadDetail(obj, elements, index) {
  return function (dispatch) {
    Rest.get('/am/' + obj.url)
      .set('Content-Type', 'Application/json')
      .end(function (err, res) {
        if (!err) {
          let data = res.body;
          if (typeof index === 'undefined') {
            obj.body_label = data.label;
            obj.body_sqlname = data.sqlname;
            elements.push(obj);
          } else {
            elements = elements.slice(0, index + 1);
          }
          dispatch(metadataDetailSuccess(data, elements));
        }
      });
  };
}

export function metadataSuccess(result, elements) {
  return {
    type: METADATA_SUCCESS,
    rows: result,
    elements: elements
  };
}

export function metadataDetailSuccess(result, elements) {
  return {
    type: METADATA_DETAIL_SUCCESS,
    rows: result,
    elements: elements
  };
}

export function loginSuccess(email, headerNavs) {
  return {type: LOGIN_SUCCESS, email, headerNavs};
}

export function loginFailure(error) {
  return {type: LOGIN_FAILURE, error: error};
}

export function routeChanged(route, prefix) {
  return {type: ROUTE_CHANGED, route: route, prefix: prefix};
}

export function navPeek(peek) {
  return {type: NAV_PEEK, peek: peek};
}

export function navActivate(active) {
  return {type: NAV_ACTIVATE, active: active};
}

export function navResponsive(responsive) {
  return {type: NAV_RESPONSIVE, responsive: responsive};
}


