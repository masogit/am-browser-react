export const HOST_NAME_DEV = 'http://localhost:8080';
export const HOST_NAME = (typeof NODE_ENV === 'undefined' || NODE_ENV === 'development') ? HOST_NAME_DEV : '';
