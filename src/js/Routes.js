// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Explorer from './components/explorer/Explorer';
import Builder from './components/builder/Builder';
import Views from './components/builder/Views';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import AmPushAdapter from './components/AmPushAdapter';
import IntegrationJob from './components/IntegrationJob';
import IntegrationJobItem from './components/IntegrationJobItem';

var rootPath = "/"; //"/ferret/";
//if (NODE_ENV === 'development') {
//  rootPath = "/"; // webpack-dev-server
//}

module.exports = {

  prefix: rootPath.slice(0, -1),

  path: (path) => (rootPath + path.slice(1)),

  routes: [
    {
      path: rootPath, component: Ferret,
      // TODO: crashes react-router, wait for fix
      //indexRoute: {
      //  onEnter: function (nextState, replaceState) {
      //    replaceState(null, '/explorer');
      //  }
      //},
      childRoutes: [
        {path: 'login', component: Login},
        {path: 'explorer', component: Explorer},
        {path: 'builder', component: Builder},
        {path: 'aql', component: AQL},
        {
          path: 'views', component: Views
        },
        {
          path: 'views/:id', component: Views
        },
        {path: 'views', component: Views},
        {path: 'pushAdapter', component: AmPushAdapter,
          childRoutes: [
            { path: ':tabName/:selectedLinkName', component: IntegrationJob,
              childRoutes: [
                { path: ':integrationJobName', component: IntegrationJobItem }
              ]
            }
          ]
        },
        //{path: 'views/:id', component: Views},
        {path: 'tbd', component: TBD}
      ]
    }
  ]
};
