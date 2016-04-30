// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Home from './components/Home';
import Explorer from './components/explorer/Explorer';
import ViewDefListContainer from './components/builder/ViewDefListContainer';
//import ViewDefDetail from './components/builder/ViewDefDetail';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import ucmdbAdapter from './components/ucmdbAdapter/ucmdbAdapter';
import IntegrationJob from './components/ucmdbAdapter/IntegrationJob';
import IntegrationJobItem from './components/ucmdbAdapter/IntegrationJobItem';

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
        {path: 'home', component: Home},
        {path: 'explorer', component: Explorer},
        {path: 'aql', component: AQL},
        {
          path: 'views(/:id)', component: ViewDefListContainer
        },
        {
          path: 'explorer(/:id)', component: Explorer
        },
        //{
        //  path: 'views', component: ViewDefList,
        //  childRoutes: [
        //    {
        //      path: ':id', component: ViewDefDetail
        //    }
        //  ]
        //},
        {path: 'ucmdbAdapter', component: ucmdbAdapter,
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
