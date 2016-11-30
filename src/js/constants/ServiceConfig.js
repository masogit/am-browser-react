// only for unit test
export const HOST_NAME_DEV = 'http://localhost:80';

export const BASE_NAME = window.amb_basename || '/';

// DB SERVICE
export const VIEW_DEF_URL = "/coll/view/";
export const GRAPH_DEF_URL = "/coll/aql/";
export const INSIGHT_DEF_URL = "/coll/wall/";
export const REPORT_DEF_URL = "/coll/report/";

// AM REST SERVICE
export const AM_DEF_URL = "/am/";
export const AM_DB_DEF_URL = "/am/db/";
export const AM_AQL_DEF_URL = "/am/query";
export const AM_SCHEMA_DEF_URL = "/am/schema";

// AMB SERVICE
export const CSRF_DEF_URL = "/am/csrf";
export const ABOUT_DEF_URL = "/am/about";
export const LOGIN_DEF_URL = "/am/login";
export const LWSSO_LOGIN_DEF_URL = "/am/lwssoLogin";
export const LOGOUT_DEF_URL = "/am/logout";
export const ONLINE_USER_DEF_URL = "/am/onlineUser";
export const DOWNLOAD_DEF_URL = `${BASE_NAME}/am/download`.replace('//', '/'); // base name can be '/' or '/amb' or '/amb/'

// UCMDB SERVICE
export const UCMDB_DEF_URL = "/ucmdb-browser/";
export const POINT_DEF_URL = "/am/ucmdbPoint/";
export const ADAPTER_DEF_URL = "/ucmdbAdapter/";

// CHATOPS
export const SLACK_DEF_URL = "/slack";

//LIVE Net WORK
export const LNW_DEF_URL = "/live-network";

// My Assets
export const CATEGORY_MY_ASSETS = 'My Assets';
