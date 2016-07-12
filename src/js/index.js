// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import 'index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
//import Router from 'react-router';
import Rest from './util/grommet-rest-promise';
//import RestWatch from './RestWatch';
import {getCurrentLocale, getLocaleData} from 'grommet/utils/Locale';
import {addLocaleData} from 'react-intl';
import en from 'react-intl/locale-data/en';
import Routes, {getRoutes, getPostLoginPath, setPostLoginPath, resetPostLoginPath} from './Routes';
import DevTools from './DevTools';
import {Provider} from 'react-redux';
import {IntlProvider} from 'react-intl';

import store from './store';
import history from './RouteHistory';
import {init, initToken, routeChanged} from './actions/system';
import {ReduxRouter} from 'redux-router';

// The port number needs to align with devServerProxy and websocketHost in gulpfile.js
//let hostName = NODE_ENV === 'development' ? 'localhost:8010' : window.location.host;

//RestWatch.initialize('ws://' + hostName + '/rest/ws');


Rest.setHeader('Accept', 'application/json');
Rest.setHeader('X-API-Version', 200);

// From a comment in https://github.com/rackt/redux/issues/637
// this factory returns a history implementation which reads the current state
// from the redux store and delegates push state to a different history.
//let createStoreHistory = () => {
//  return {
//    listen: (callback) => {
//      // subscribe to the redux store. when `route` changes, notify the listener
//      let notify = () => {
//        const route = store.getState().route;
//        if (route) {
//          callback(route);
//        }
//      };
//      const unsubscribe = store.subscribe(notify);
//
//      return unsubscribe;
//    },
//    createHref: history.createHref,
//    pushState: history.pushState,
//    push: history.push
//  };
//};

let element = document.getElementById('content');

let locale = getCurrentLocale();
addLocaleData(en);

let messages;
try {
  messages = require('../messages/' + locale);
} catch (e) {
  messages = require('../messages/en-US');
}
var localeData = getLocaleData(messages, locale);

import cookies from 'js-cookie';

if (cookies.get('headerNavs')) {
  store.dispatch(init(cookies.get('user'), cookies.get('headerNavs')));
}

const renderPage = () => {
  Routes.routes[0].childRoutes = getRoutes(store.getState().session.headerNavs);
  document.body.classList.remove('loading');
  if (process.env.NODE_ENV === 'production') {
    ReactDOM.render((
      <div>
        <Provider store={store}>
          <IntlProvider locale={localeData.locale} messages={localeData.messages}>
            <ReduxRouter routes={Routes.routes}/>
          </IntlProvider>
        </Provider>
      </div>
    ), element);
  } else {
    ReactDOM.render((
      <div>
        <Provider store={store}>
          <IntlProvider locale={localeData.locale} messages={localeData.messages}>
            <div>
              <ReduxRouter routes={Routes.routes}/>
              <DevTools store={store}/>
            </div>
          </IntlProvider>
        </Provider>
      </div>
    ), element);
  }
};

if (process.env.NODE_ENV === 'production') {
  renderPage();
} else {
  initToken().end(renderPage());
}

// check for session
const sessionWatcher = () => {
  const {route, session} = store.getState();
  if (session.loggedout) {
    resetPostLoginPath();
  }

  if (route) {
    if (session.headerNavs) {
      Routes.routes[0].childRoutes = getRoutes(session.headerNavs);
      if (route.pathname === '/login') {
        history.pushState(null, Routes.path(getPostLoginPath()));
      }
    } else {
      Routes.routes[0].childRoutes = getRoutes(null);
      if (route.pathname !== Routes.path('/login')) {
        setPostLoginPath(route.pathname);
        history.pushState(null, Routes.path('/login'));
      }
    }
  }
};
store.subscribe(sessionWatcher);

// listen for history changes and initiate routeChanged actions for them
history.listen(function (location) {
  store.dispatch(routeChanged(location, Routes.prefix));
});
