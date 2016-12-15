// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from '../util/grommet-rest-promise';
import * as Types from '../constants/ActionTypes';
import store from '../store';
import {saveAs} from 'file-saver';
import {
  CSRF_DEF_URL,
  ABOUT_DEF_URL,
  LOGIN_DEF_URL,
  LWSSO_LOGIN_DEF_URL,
  LOGOUT_DEF_URL,
  AM_SCHEMA_DEF_URL,
  AM_DEF_URL,
  ONLINE_USER_DEF_URL
} from '../constants/ServiceConfig';

export function init(email, headerString) {
  try {
    const headerNavs = JSON.parse(headerString.substring(headerString.indexOf('{')));
    return {type: Types.INIT, email, headerNavs};
  } catch (e) {
    return {type: Types.INIT};
  }
}

export function initToken() {
  return Rest.get(CSRF_DEF_URL).then(res => {
    //console.log('CSRF: ' + cookies.get('csrf-token'));
  }, err => {
    if (err) {
      console.log('Get CSRF failed');
      throw err;
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

export function lwssoPreAuthenticate(retry) {
  return function (dispatch) {
    return Rest.post(LWSSO_LOGIN_DEF_URL)
      .then(res => {
        if (res.body) {
          const headerNavs = res.body.headerNavs;
          const username = res.body.username;
          dispatch(loginSuccess(username, headerNavs));
        } else {
          dispatch(loginFailure({message: res.text}));
        }
      }, err => {
        if (err) {
          let message = err.response ? err.response.text : '', retrying = false;
          const CANNOT_CONNECT_REST = 'Can not connect to rest server.';
          const CANNOT_CONNECT_NODE = 'Can not connect to node server.';
          if (err.status) {
            if (err.status == 500 && message.indexOf('ECONNREFUSED') > -1) {
              message = CANNOT_CONNECT_REST;
            } else if(err.status == 502) {
              message = CANNOT_CONNECT_NODE;
            } else if (err.status == 403 && message.indexOf('invalid csrf token') > -1) {
              message = 'Invalid csrf token';
              if (!retry) {
                lwssoPreAuthenticate(true)(dispatch);
                retrying = true;
              }
            }
          } else {
            message = err.message.indexOf('network is offline') > -1 ? CANNOT_CONNECT_NODE : err.message;
          }

          if (!retrying) {
            dispatch(loginFailure({message: 'Login failed. ' + message}));
          }
        }
      });
  };
}

export function login(username, password, callback, retry) {
  return function (dispatch) {
    const auth = 'Basic ' + new Buffer(`${username}:${password}`).toString('base64');
    return Rest.post(LOGIN_DEF_URL)
      .set("Authorization", auth)
      .then(res => {
        if (res.body) {
          const headerNavs = res.body.headerNavs;
          dispatch(loginSuccess(username, headerNavs));
        } else {
          dispatch(loginFailure({message: res.text}));
        }
        return null;
      }, err => {
        if (err) {
          let message = err.response ? err.response.text : '', retrying = false;
          const CANNOT_CONNECT_REST = 'Can not connect to rest server.';
          const CANNOT_CONNECT_NODE = 'Can not connect to node server.';
          if (err.status) {
            if (err.status == 500 && message.indexOf('ECONNREFUSED') > -1) {
              message = CANNOT_CONNECT_REST;
            } else if(err.status == 502) {
              message = CANNOT_CONNECT_NODE;
            } else if (err.status == 403 && message.indexOf('invalid csrf token') > -1) {
              message = 'Invalid csrf token';
              if (!retry) {
                login(username, password, callback, true)(dispatch);
                retrying = true;
              }
            }
          } else {
            message = err.message.indexOf('network is offline') > -1 ? CANNOT_CONNECT_NODE : err.message;
          }

          if (!retrying) {
            dispatch(loginFailure({message: 'Login failed. ' + message}));
          }
        }
        return null;
      }).then(callback);
  };
}

export function logout() {
  return function (dispatch) {
    return Rest.get(LOGOUT_DEF_URL).then(res => {
      dispatch({type: Types.LOGOUT});
    }, err => {
      if (err) {
        throw err;
      }
    });
  };
}

export function metadataLoad() {
  return Rest.get(AM_SCHEMA_DEF_URL)
    .set('Content-Type', 'Application/json')
    .then(res => {
      if (res.ok) {
        return res.body;
      }
    });
}

export function metadataLoadDetail(obj, elements) {
  return Rest.get(AM_DEF_URL + obj.url)
    .set('Content-Type', 'Application/json')
    .then(res => {
      if (res.ok) {
        const rows = res.body;
        obj.body_label = rows.label;
        obj.body_sqlname = rows.sqlname;
        return {
          rows,
          elements: [...elements, obj]
        };
      }
    });
}

function loginSuccess(email, headerNavs) {
  return {type: Types.LOGIN_SUCCESS, email, headerNavs};
}

export function loginFailure(error) {
  return {type: Types.LOGIN_FAILURE, error: error};
}

export function routeChanged(route, prefix) {
  return {type: Types.ROUTE_CHANGED, route: route, prefix: prefix};
}

export function navResponsive(responsive) {
  return {type: Types.NAV_RESPONSIVE, responsive: responsive};
}

export function loadMetadataDetailSuccess(rows, elements) {
  return {type: Types.LOAD_METADATA_DETAIL_SUCCESS, rows, elements};
}

export function loadAllMetadataSuccess(rows) {
  return {type: Types.LOAD_ALL_METADATA_SUCCESS, rows};
}

export function showError(msg) {
  store.dispatch({type: Types.RECEIVE_ERROR, msg});
}

export function showWarning(msg) {
  store.dispatch({type: Types.RECEIVE_WARNING, msg});
}

export function showInfo(msg) {
  store.dispatch({type: Types.RECEIVE_INFO, msg});
}

export function monitorEdit(origin, now) {
  store.dispatch({type: Types.MONITOR_EDIT, edit: {origin, now}});
}

export function stopMonitorEdit() {
  store.dispatch({type: Types.STOP_MONITOR_EDIT});
}

export function alert({msg, onConfirm, title}) {
  store.dispatch({type: Types.ALERT, msg, onConfirm, title});
}

export function dropCurrentPop(origin, current, initState, title, onConfirm) {
  if(current._id ? !_.isEqual(origin, current) : !_.isEmpty(current) && !_.isEqual(initState, current)) {
    const alertInfo = {
      onConfirm,
      title,
      msg: 'Your current change are not saved, click confirm to drop the change'
    };
    alert(alertInfo);
  } else {
    onConfirm();
  }
}

export function dropCurrentPop_stopMonitor(title, onConfirm) {
  const state = store.getState();
  if(state.session.edit) {
    let now = state.session.edit.now;
    if (typeof now == 'string') {
      const params = now.split('.');
      now = params.reduce((state, next) => state[next], state);
    }
    if(!_.isEqual(state.session.edit.origin, now)) {
      const alertInfo = {
        onConfirm: () => {
          stopMonitorEdit();
          onConfirm();
        },
        msg: 'Your current change are not saved, click confirm to drop the change',
        title
      };

      alert(alertInfo);
    } else {
      stopMonitorEdit();
      onConfirm();
    }
  } else {
    stopMonitorEdit();
    onConfirm();
  }
}

export function toggleSidebar(showSidebar = !store.getState().session.showSidebar) {
  if (showSidebar != store.getState().session.showSidebar) {
    store.dispatch({type: Types.TOGGLE_SIDEBAR});
  }
}

export function getOnlineUser() {
  return Rest.get(ONLINE_USER_DEF_URL)
    .then(res => {
      return res.body || [];
    });
}

export function isAqlInputAllowed() {
  const state = store.getState();
  if (state.session.headerNavs)
    return state.session.headerNavs.aqlInput;
  return false;
}

export function onMail(obj, subject, urlLocation, secondLine) {
  if (obj._id) {
    const fullSubject = `AM Browser ${subject}: ${obj.name}`;
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }
    const url = `${window.location.origin}/${urlLocation}/${obj._id}`;
    let content = `URL: ${url}`;
    if (secondLine) {
      content += '%0D%0A' + secondLine;
    }
    window.open(`mailto:test@example.com?subject=${fullSubject}&body=${content}`, '_self');
  }
}

export function onDownload(obj, name) {
  if (obj._id) {
    let blob = new Blob([JSON.stringify(obj)], {type: "data:application/json;charset=utf-8"});
    saveAs(blob, name + ".json");
  }
}
