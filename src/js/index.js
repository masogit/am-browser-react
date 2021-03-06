// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

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
import {init, initToken, lwssoPreAuthenticate, routeChanged} from './actions/system';
import {ReduxRouter} from 'redux-router';
import {saveSetting} from './util/util';

if (process.env.NODE_ENV !== 'production') {
  require('index.scss');
}

Rest.setHeader('Accept', 'application/json');
Rest.setHeader('X-API-Version', 200);

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

store.dispatch(lwssoPreAuthenticate());

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
  initToken().then(renderPage);
}

let loadingIconMap = false;
const getIconMap = () => {
  if (!loadingIconMap) {
    loadingIconMap = true;
    Rest.get('/icon-map').then((res) => {
      if (res.text) {
        const iconMap = JSON.parse(res.text);
        saveSetting('iconMap', iconMap);
      }
    }, (err) => {
      console.log(err.response ? err.response.text : err);
      loadingIconMap = false;
    });
  }
};

// check for session
const sessionWatcher = () => {
  const {route, session} = store.getState();
  if (session.loggedout) {
    resetPostLoginPath();
  }

  if (route) {
    Routes.routes[0].childRoutes = getRoutes(session.headerNavs);
    const isAuthorized = !!session.headerNavs;
    const isLoginUrl = route.pathname === Routes.path('/login');
    if (isAuthorized) {
      getIconMap();
      if (isLoginUrl) {
        history.pushState(null, Routes.path(getPostLoginPath()));
      }
    } else if (!isAuthorized && !isLoginUrl) {
      setPostLoginPath(route.pathname);
      history.pushState(null, Routes.path('/login'));
    }
  }
};
store.subscribe(sessionWatcher);

// listen for history changes and initiate routeChanged actions for them
history.listen(function (location) {
  store.dispatch(routeChanged(location, Routes.prefix));
});

window.onbeforeunload = () => {
  const state = store.getState();
  if (state.session.edit) {
    let now = state.session.edit.now;
    if (typeof now == 'string') {
      const params = now.split('.');
      now = params.reduce((state, next) => state[next], state);
    }
    if (!_.isEqual(state.session.edit.origin, now)) {
      return true;
    }
  }
};

