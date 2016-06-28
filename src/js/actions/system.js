// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from '../util/grommet-rest-promise';
import cookies from 'js-cookie';
import * as Types from '../constants/ActionTypes';
import {
  CSRF_DEF_URL,
  ABOUT_DEF_URL,
  LOGIN_DEF_URL,
  LOGOUT_DEF_URL,
  SLACK_DEF_URL,
  AM_SCHEMA_DEF_URL,
  AM_DEF_URL
} from '../constants/ServiceConfig';

// session
export const INIT = 'INIT';
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

export const METADATA_SUCCESS = 'METADATA_SUCCESS';
export const METADATA_DETAIL_SUCCESS = 'METADATA_DETAIL_SUCCESS';

export function init(email, headerString) {
  try {
    const headerNavs = JSON.parse(headerString.substring(headerString.indexOf('{')));
    return {type: INIT, email, headerNavs};
  } catch (e) {
    return {type: INIT};
  }
}

export function initToken() {
  return Rest.get(CSRF_DEF_URL).end((err, res) => {
    if (err || !res.ok) {
      console.log('Get CSRF failed');
      throw err;
    } else {
      console.log('CSRF: ' + cookies.get('csrf-token'));
    }
  });
}

export function initAbout() {
  return Rest.get(ABOUT_DEF_URL).then((res) => {
    return res.body;
  }, (err) => {
    console.log('Get About failed');
    throw err;
  });
}

export function login(username, password, retry) {
  return function (dispatch) {
    const auth = 'Basic ' + new Buffer(`${username}:${password}`).toString('base64');
    Rest.post(LOGIN_DEF_URL)
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
    Rest.get(LOGOUT_DEF_URL).end((err, res) => {
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
    Rest.post(SLACK_DEF_URL, {messages}).then(res => {
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

export function metadataLoad() {
  return function (dispatch) {
    Rest.get(AM_SCHEMA_DEF_URL)
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
    Rest.get(AM_DEF_URL + obj.url)
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

export function navResponsive(responsive) {
  return {type: NAV_RESPONSIVE, responsive: responsive};
}

