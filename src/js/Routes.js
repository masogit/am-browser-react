// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Search from './components/explorer/Search';
import RecordSearch from './components/explorer/RecordSearch';
import Wall from './components/aql/Wall';
import Explorer from './components/explorer/Explorer';
import ViewDefListContainer from './components/builder/ViewDefListContainer';
//import ViewDefDetail from './components/builder/ViewDefDetail';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import UCMDBAdapterContainer from './components/ucmdbAdapter/UCMDBAdapterPoint';
import { getHeaderNavs } from './actions';
var rootPath = "/"; //"/ferret/";
//if (NODE_ENV === 'development') {
//  rootPath = "/"; // webpack-dev-server
//}

export const getRoutes = () => {
  const headerNavs = getHeaderNavs();

  const allRoutes = [
    {path: 'login', component: Login},
    {path: 'search', component: Search},
    {path: 'search(/:keyword)', component: RecordSearch},
    {path: 'insight', component: Wall},
    {path: 'insight(/:id)', component: Wall},
    {path: 'explorer', component: Explorer},
    {path: 'explorer(/:id)', component: Explorer},
    {path: 'tbd', component: TBD},
    {path: 'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)', component: UCMDBAdapterContainer},
    {path: 'aql', component: AQL},
    {path: 'views(/:id)', component: ViewDefListContainer}
  ];

  const routes = [];
  allRoutes.map(route => {
    const basePath = route.path.split('(')[0];
    if (!headerNavs || headerNavs[basePath]) {
      routes.push(route);
    }
  });

  if (routes.length > 0) {
    routes.push({
      path: '*',
      component: Search,
      onEnter: (nextState, replaceState) => replaceState(null, '/search')
    });
  }
  return routes;
};

const Route = {

  prefix: rootPath.slice(0, -1),

  path: (path) => (rootPath + path.slice(1)),
  routes: [
    {
      indexRoute: { component: Search },
      path: rootPath, component: Ferret,
      childRoutes: getRoutes()
    }
  ]
};

export default Route;
