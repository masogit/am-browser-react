import devConfig from '../dev.json';

export const HOST_NAME = (typeof NODE_ENV === 'undefined' || NODE_ENV === 'development') ? devConfig["node-server"] : '';
export const VIEW_DEF_URL = "/coll/view";
export const AM_FORM_DATA = "amFormData";
