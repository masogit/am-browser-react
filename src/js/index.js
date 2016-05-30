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
import Routes, {getRoutes} from './Routes';
import DevTools from './DevTools';
import {Provider} from 'react-redux';
import {IntlProvider} from 'react-intl';

import store from './store';
import history from './RouteHistory';
import {init, routeChanged/*, loginSuccess*/} from './actions';
import {AM_FORM_DATA} from './util/Config';
import {ReduxRouter} from 'redux-router';

// The port number needs to align with devServerProxy and websocketHost in gulpfile.js
//let hostName = NODE_ENV === 'development' ? 'localhost:8010' : window.location.host;

//RestWatch.initialize('ws://' + hostName + '/rest/ws');


Rest.setHeader('Accept', 'application/json');
Rest.setHeader('X-API-Version', 200);

if (!Rest.get('header').header.Authorization) {
  const storage = window.localStorage && window.localStorage[AM_FORM_DATA];
  if (storage) {
    const form = JSON.parse(storage);
    const auth = 'Basic ' + new Buffer(form.user + ':' + form.password).toString('base64');
    Rest.setHeader("Authorization", auth);
  }
}

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

document.body.classList.remove('loading');

import cookies from 'js-cookie';

store.dispatch(init(cookies.get('user'), cookies.get('csrf-token')));
// simulate initial login
//store.dispatch(loginSuccess('nobody@grommet.io', 'simulated'));

let postLoginPath = '/search';

// check for session
const sessionWatcher = () => {
  const {route, session} = store.getState();
  Routes.routes[0].childRoutes = getRoutes();

  if (route) {
    if (session.token) {
      if (route.pathname === '/login') {
        history.pushState(null, Routes.path(postLoginPath));
      }
    } else {
      if (route.pathname !== Routes.path('/login')) {
        postLoginPath = route.pathname;
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
