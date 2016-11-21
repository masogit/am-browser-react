// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Main from './components/Main';
import Login from './components/Login';
import RecordSearch from './components/explorer/RecordSearch';
import Insight from './components/aql/Insight';
import SAM from './components/sam/SAMContainer';
import Explorer from './components/explorer/Explorer';
import Report from './components/reports/reports';
import ViewDefListContainer from './components/builder/ViewDefListContainer';
import AQL from './components/aql/AQL';
import TBD from 'grommet/components/TBD';
import MyAssets from './components/MyAssets/MyAssets';
import UnAuthorized from './components/error/UnAuthorized';
import UCMDBAdapterContainer from './components/ucmdbAdapter/UCMDBAdapterPoint';
var rootPath = "/";

const indexRoute = {component: Main};
const DEFAULT_PATH = '/search';

let postLoginPath = DEFAULT_PATH;
export const getPostLoginPath = () => postLoginPath;
export const setPostLoginPath = (path) => postLoginPath = path;
export const resetPostLoginPath = () => postLoginPath = DEFAULT_PATH;

export const getRoutes = (headerNavs) => {
  const routes = [{path: 'login', component: Login}];
  if (headerNavs) {
    const allRoutes = [
      {path: 'insight', component: Insight},
      {path: 'insight/:id', component: Insight},
      {path: 'search/:keyword', component: RecordSearch},
      {path: 'explorer', component: Explorer},
      {path: 'explorer/:id', component: Explorer},
      {path: 'report', component: Report},
      {path: 'tbd', component: TBD},
      {path: 'ucmdbAdapter', component: UCMDBAdapterContainer},
      {path: 'ucmdbAdapter(/:pointName)(/:tabName)(/:integrationJobName)', component: UCMDBAdapterContainer},
      {path: 'aql', component: AQL},
      {path: 'views', component: ViewDefListContainer},
      {path: 'views/:id', component: ViewDefListContainer},
      {path: 'my', component: MyAssets},
      {path: 'sam', component: SAM},
      {path: 'sam/:id', component: SAM}
    ];

    allRoutes.map(route => {
      if (headerNavs[route.path]) {
        routes.push(route);
      } else {
        routes.push({
          path: route.path,
          component: UnAuthorized
        });
      }
    });
    indexRoute.component = routes[1].component;
  } else {
    indexRoute.component = Main;
  }

  routes.push({
    path: '*',
    component: Insight,
    onEnter: (nextState, replaceState) => {
      var goToLink = routes[0].path;
      if (headerNavs) {
        goToLink = routes[1].path;
      } else {
        postLoginPath = nextState.location.pathname;
      }
      replaceState(null, '/' + goToLink);
    }
  });

  return routes;
};

const Route = {

  prefix: rootPath.slice(0, -1),

  path: (path) => (rootPath + path.slice(1)),
  routes: [
    {
      indexRoute: indexRoute,
      path: rootPath, component: Main,
      childRoutes: getRoutes()
    }
  ]
};

export default Route;
