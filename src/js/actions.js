// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from 'grommet/utils/Rest';
//import history from './RouteHistory';
//import Query from 'grommet-index/utils/Query';
import IndexApi from './Api';
import {HOST_NAME, getFormData} from './util/Config';

// session
export const INIT = 'INIT';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// route
export const ROUTE_CHANGED = 'ROUTE_CHANGED';

// nav
export const NAV_PEEK = 'NAV_PEEK';
export const NAV_ACTIVATE = 'NAV_ACTIVATE';
export const NAV_RESPONSIVE = 'NAV_RESPONSIVE';

// dashboard
export const DASHBOARD_LAYOUT = 'DASHBOARD_LAYOUT';
export const DASHBOARD_LOAD = 'DASHBOARD_LOAD';
export const DASHBOARD_UNLOAD = 'DASHBOARD_UNLOAD';
export const DASHBOARD_SEARCH = 'DASHBOARD_SEARCH';
export const DASHBOARD_SEARCH_SUCCESS = 'DASHBOARD_SEARCH_SUCCESS';

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

export function init(email, token) {
  return {type: INIT, email: email, token: token};
}

//export function login(email, password) {
//  return function (dispatch) {
//    Rest.post('/rest/login-sessions',
//      {email: email, password: password})
//      .end(function(err, res) {
//        if (err || !res.ok) {
//          dispatch(loginFailure(res.body));
//        } else {
//          dispatch(loginSuccess(email, res.body.sessionID));
//        }
//      });
//  };
//}

let formData = getFormData();
const getAuth = () => {
  var AM_FORM_DATA = "amFormData";
  if (localStorage && localStorage[AM_FORM_DATA]) {
    var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
    if (form.user) formData.user = form.user;
    if (form.password) formData.password = form.password;
  }
  return 'Basic ' + new Buffer(formData.user + ':' + formData.password).toString('base64');
};

export function login(username, password) {
  return function (dispatch) {
    var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    Rest.setHeader("Authorization", auth);
    Rest.get(HOST_NAME + '/am/conf').end((err, res) => {
      if (err) {
        console.log("failed");
        dispatch(loginFailure({message: 'LoginFailed'}));
        throw err;
      } else if (res.ok) {
        // set AM server address
        if (res.body.server)
          formData.server = res.body.server;

        if (res.body.hasAdminPrivilege !== undefined)
          formData.hasAdminPrivilege = res.body.hasAdminPrivilege;

        var AM_FORM_DATA = "amFormData";
        formData['ref-link'] = "db/amEmplDept";
        formData.param.filter = "UserLogin='" + username.trim() + "'";
        formData.user = username;
        formData.password = password;
        if (localStorage) {
          var form = {
            server: formData.server,
            user: formData.user,
            password: formData.password,
            hasAdminPrivilege: formData.hasAdminPrivilege
          };
          localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }

        if (sessionStorage) {
          var form = {
            server: formData.server,
            user: formData.user,
            hasAdminPrivilege: formData.hasAdminPrivilege
          };
          sessionStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }
        console.log("pass");
        console.log('res.body: ' + res.body);
        dispatch(loginSuccess(username, 'faketoken123456789'/*res.body.sessionID*/));
      }
    });
  };
}

export function metadataLoad() {
  return function (dispatch) {
    let  headers = {
      "Content-Type": "text/xml",
      "Authorization": getAuth()
    };
    Rest.setHeaders(headers);
    Rest.get(HOST_NAME + '/am/v1/schema')
      .end(function (err, res) {
        if (!err) {
          let data = JSON.parse(res.text);
          dispatch(metadataSuccess(data, []));
        }
      });
  };
}

export function metadataLoadDetail(obj, elements, index) {
  return function (dispatch) {
    var AM_FORM_DATA = "amFormData";
    if (localStorage && localStorage[AM_FORM_DATA]) {
      var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
      if (form.user) formData.user = form.user;
      if (form.password) formData.password = form.password;
    }
    //let  headers = { 'Accept': 'application/json' };
    //Rest.setHeaders(headers);
    let auth = 'Basic ' + new Buffer(formData.user + ':' + formData.password).toString('base64');
    let  headers = {
      "Content-Type": "text/xml",
      "Authorization": auth
    };
    Rest.setHeaders(headers);
    Rest.get(HOST_NAME + '/am/v1/' + obj.url)
      .end(function (err, res) {
        if (!err) {
          let data = JSON.parse(res.text);
          if (!index) {
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

export function loadTemplates() {
  return function (dispatch) {
    Rest.get(HOST_NAME + '/coll/view').end(function (err, res) {
      if (res && res.ok) {
        dispatch(templatesLoadSuccess(res.body));
      }
    });
  };
};

export function loadRecords(template) {
  return function (dispatch) {
    Rest.get(HOST_NAME + '/coll/view/' + template._id + '/list').end(function (err, res) {
      if (res && res.ok && res.body) {
        dispatch(recordsLoadSuccess(res.body.entities));
      }
    });
  };
};

export function loadDetailRecordLinks (viewid, recordid, linksArray, linksObj) {
  return function (dispatch) {
    var link = linksArray.pop();
    if (link) {
      var linkname = link.sqlname;
      Rest.get(HOST_NAME + `/coll/view/${viewid}/list/${recordid}/${linkname}`).end(function (err, res) {
        if (res.body && res.body.entities) {
          linksObj[linkname] = res.body.entities;
          dispatch(loadDetailRecordLinks(viewid, recordid, linksArray, linksObj));
        }
      });
    } else {

      dispatch(loadDetailLinkSuccess(linksObj));
    }

  };
};

export function loadDetailLinkSuccess(links) {
  return {
    type: "LOAD_DETAIL_LINK_SUCCESS",
    links: links
  };
}

export function loadDetailRecord(template, record) {

  return function (dispatch) {

    var fields = template.body.fields.filter(function(field) {
      if (!field.PK) {
        field.value = record[field.sqlname];
        return field;
      }
    });

    var links = {};
    var linksArray = Object.assign([], template.body.links);

    dispatch(loadDetailRecordLinks(template._id, record['ref-link'].split('/')[2], linksArray, links));

    dispatch(detailRecordLoadSuccess(fields));
  };
};

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

export function templatesLoadSuccess(result) {
  return {
    type: TEMPLATE_LOAD_SUCCESS,
    templates: result
  };
}

export function recordsLoadSuccess(result) {
  return {
    type: RECORD_LOAD_SUCCESS,
    records: result
  };
}

export function detailRecordLoadSuccess(result) {
  return {
    type: DETAIL_RECORD_LOAD_SUCCESS,
    record: result
  };
}

export function loginSuccess(email, token) {
  return {type: LOGIN_SUCCESS, email: email, token: token};
}

export function loginFailure(error) {
  return {type: LOGIN_FAILURE, error: error};
}

export function logout() {
  return {type: LOGOUT};
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

export function dashboardLayout(graphicSize, count, legendPlacement, tiles) {
  return function (dispatch) {
    dispatch({
      type: DASHBOARD_LAYOUT,
      graphicSize: graphicSize,
      count: count,
      legendPlacement: legendPlacement
    });
    // reset what we're watching for
    tiles.filter((tile) => (tile.history)).forEach((tile) => {
      IndexApi.stopWatching(tile.watcher);
      let params = {
        category: tile.category,
        query: tile.query,
        attribute: tile.attribute,
        interval: tile.interval,
        count: count
      };
      let watcher = IndexApi.watchAggregate(params, (result) => {
        dispatch(indexAggregateSuccess(watcher, tile.name, result));
      });
    });
  };
}

export function dashboardLoad(tiles) {
  return function (dispatch) {
    dispatch({type: DASHBOARD_LOAD});
    tiles.forEach((tile) => {
      let params = {
        category: tile.category,
        query: tile.query,
        attribute: tile.attribute,
        interval: tile.interval,
        count: tile.count
      };
      let watcher = IndexApi.watchAggregate(params, (result) => {
        dispatch(indexAggregateSuccess(watcher, tile.name, result));
      });
    });
  };
}

export function dashboardUnload(tiles) {
  return function (dispatch) {
    dispatch({type: DASHBOARD_UNLOAD});
    tiles.forEach((tile) => {
      IndexApi.stopWatching(tile.watcher);
    });
  };
}

export function dashboardSearch(text) {
  return function (dispatch) {
    dispatch({type: DASHBOARD_SEARCH, text: text});
    if (text && text.length > 0) {
      let params = {
        start: 0,
        count: 5,
        query: text
      };
      Rest.get('/rest/index/search-suggestions', params).end((err, res) => {
        if (err) {
          throw err;
        } else if (res.ok) {
          dispatch({type: DASHBOARD_SEARCH_SUCCESS, result: res.body});
        }
      });
    }
  };
}
