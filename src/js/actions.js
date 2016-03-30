// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Rest from 'grommet/utils/Rest';
//import history from './RouteHistory';
//import Query from 'grommet-index/utils/Query';
import IndexApi from './Api';
import {HOST_NAME} from './constants/Config';

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
export const METADATA_FILTER_SUCCESS = 'METADATA_FILTER_SUCCESS';

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

let formData = {
  server: "localhost:8081", // "16.165.217.186:8081",
  context: "/AssetManagerWebService/rs/",
  "ref-link": "",     // "db/amLocation/126874",
  collection: "",     // "EmplDepts",
  param: {
    limit: "100",
    offset: "0",
    filter: "",
    orderby: "",
    fields: []
  },

  method: "get",
  user: "", // admin
  password: "",

  pageSize: 10,
  viewStyle: "tile",
  //        showError: false,
  showLabel: false
};

export function login(username, password) {
  return function (dispatch) {
    var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    Rest.setHeader("Authorization", auth);
    Rest.get(HOST_NAME + '/am/conf').end((err, res) => {
          if (err) {
            throw err;
          } else if (res.ok) {

          // set AM server address
          formData['server'] = res.body.server;

          var AM_FORM_DATA = "amFormData";
          formData['ref-link'] = "db/amEmplDept";
          formData.param.filter = "UserLogin='" + username.trim() + "'";
          formData.user = username;
          formData.password = password;
          Rest.post(HOST_NAME + '/am/rest', formData)
            .end(function (err, res) {
              //console.log(error);
              console.log(res);
              if (err || !res.ok) {
                dispatch(loginFailure({message: 'LoginFailed'}));
                console.log("error");
              } else {
                if (res.body instanceof Object) {
                  if (localStorage) {
                    var form = {
                      server: formData.server,
                      user: formData.user,
                      password: formData.password,
                      pageSize: formData.pageSize,
                      showLabel: formData.showLabel,
                      //                showError: $scope.formData.showError,
                      limit: formData.param.limit,
                      offset: formData.param.offset,
                      viewStyle: formData.viewStyle
                    };
                    localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
                  }

                  if (sessionStorage) {
                    var form = {
                      server: formData.server,
                      user: formData.user
                    };
                    sessionStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
                  }
                  console.log("pass");
                  console.log('res.body: ' + res.body);
                  dispatch(loginSuccess(username, 'faketoken123456789'/*res.body.sessionID*/));
                } else {
                  console.log("failed");
                  dispatch(loginFailure({message: 'LoginFailed'}));
                }
              }
            });
          }
        });

  };
}

export function metadataLoad() {
  return function (dispatch) {
    var AM_FORM_DATA = "amFormData";
    if (localStorage && localStorage[AM_FORM_DATA]) {
      var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
      if (form.server) formData.server = form.server;
      if (form.user) formData.user = form.user;
      if (form.password) formData.password = form.password;
      if (form.pageSize) formData.pageSize = form.pageSize;
      if (form.showLabel) formData.showLabel = form.showLabel;
      //        $scope.formData.showError = form.showError;
      if (form.limit) formData.param.limit = form.limit;
      if (form.offset) formData.param.offset = form.offset;
      if (form.viewStyle) formData.viewStyle = form.viewStyle;
    }
    let metadata = "metadata/tables";
    formData.metadata = metadata;
    Rest.post(HOST_NAME + '/am/metadata', formData)
      .end(function (err, res) {
        let data=[];
        for (var t in  res.body.Tables.Table) {
          data.push(res.body.Tables.Table[t].$);
        }
        dispatch(metadataSuccess(data));
      });
  };
}

export function metadataLoadDetail(schema) {
  return function (dispatch) {
    var AM_FORM_DATA = "amFormData";
    if (localStorage && localStorage[AM_FORM_DATA]) {
      var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
      if (form.server) formData.server = form.server;
      if (form.user) formData.user = form.user;
      if (form.password) formData.password = form.password;
      if (form.pageSize) formData.pageSize = form.pageSize;
      if (form.showLabel) formData.showLabel = form.showLabel;
      //        $scope.formData.showError = form.showError;
      if (form.limit) formData.param.limit = form.limit;
      if (form.offset) formData.param.offset = form.offset;
      if (form.viewStyle) formData.viewStyle = form.viewStyle;
    }
    let metadata = "metadata/schema/" + schema;
    formData.metadata = metadata;
    Rest.post(HOST_NAME + '/am/metadata', formData)
      .end(function (err, res) {
        let data=[];
        for (var t in  res.body.table.field) {
          data.push(res.body.table.field[t].$);
        }
        for (var t in  res.body.table.link) {
          data.push(res.body.table.link[t].$);
        }
        dispatch(metadataDetailSuccess(data));
      });
  };
}

export function metadataSearch(rows, value) {
  return function (dispatch) {
    let data = rows.filter(function(obj) {
      return obj.id.indexOf(value) > -1;
    });
    dispatch(metadataFilterSuccess(data));
  };
}

export function metadataSuccess(result) {
  return {
    type: METADATA_SUCCESS,
    rows: result,
    filterRows: result
  };
}

export function metadataDetailSuccess(result) {
  return {
    type: METADATA_DETAIL_SUCCESS,
    filterFields: result
  };
}

export function metadataFilterSuccess(result) {
  return {
    type: METADATA_FILTER_SUCCESS,
    filterRows: result
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


