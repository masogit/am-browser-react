// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Home from './components/Home';
import Wall from './components/aql/Wall';
import Explorer from './components/explorer/Explorer';
import ViewDefListContainer from './components/builder/ViewDefListContainer';
//import ViewDefDetail from './components/builder/ViewDefDetail';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import UCMDBAdapterContainer from './components/ucmdbAdapter/UCMDBAdapterPoint';

var rootPath = "/"; //"/ferret/";
//if (NODE_ENV === 'development') {
//  rootPath = "/"; // webpack-dev-server
//}

export const getRoutes = () => {
  const routes = [
    {path: 'login', component: Login},
    {path: 'home', component: Home},
    {path: 'wall', component: Wall},
    {path: 'explorer', component: Explorer},
    {path: 'explorer(/:id)', component: Explorer},
    {path: 'tbd', component: TBD}
  ];

  const hasAdminPrivilege = (localStorage && localStorage.amFormData && JSON.parse(localStorage.amFormData).hasAdminPrivilege) || (sessionStorage && sessionStorage.amFormData && JSON.parse(sessionStorage.amFormData).hasAdminPrivilege);
  if (hasAdminPrivilege) {
    routes.push(...[
      {path: 'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)', component: UCMDBAdapterContainer},
      {path: 'aql', component: AQL},
      {path: 'views(/:id)', component: ViewDefListContainer}
    ]);
  }
  return routes;
};



const Route = {

  prefix: rootPath.slice(0, -1),

  path: (path) => (rootPath + path.slice(1)),

  routes: [
    {
      path: rootPath, component: Ferret,
      childRoutes: getRoutes()
    }
  ]
};

export default Route;
