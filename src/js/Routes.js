// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import Search from './components/explorer/Search';
import RecordSearch from './components/explorer/RecordSearch';
import Insight from './components/aql/Insight';
import Explorer from './components/explorer/Explorer';
import ViewDefListContainer from './components/builder/ViewDefListContainer';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import UCMDBAdapterContainer from './components/ucmdbAdapter/UCMDBAdapterPoint';
var rootPath = "/"; //"/ferret/";

export const getRoutes = (headerNavs) => {
  const routes = [
    {path: 'login', component: Login},
    {path: 'search', component: Search}];
  if (headerNavs) {
    const allRoutes = [
      {path: 'search(/:keyword)', component: RecordSearch},
      {path: 'insight', component: Insight},
      {path: 'insight(/:id)', component: Insight},
      {path: 'explorer', component: Explorer},
      {path: 'explorer(/:id)', component: Explorer},
      {path: 'tbd', component: TBD},
      {path: 'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)', component: UCMDBAdapterContainer},
      {path: 'aql', component: AQL},
      {path: 'views(/:id)', component: ViewDefListContainer}
    ];

    allRoutes.map(route => {
      const basePath = route.path.split('(')[0];
      if (!headerNavs || headerNavs[basePath]) {
        routes.push(route);
      }
    });
  }

  routes.push({
    path: '*',
    component: Search,
    onEnter: (nextState, replaceState) => replaceState(null, '/search')
  });

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
