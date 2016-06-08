import { jsdom } from 'jsdom';

global.document = jsdom(
  '<!doctype html><html><body></body></html>',
  {
    url: 'http://localhost' // https://github.com/tmpvar/jsdom/issues/1378
  });
global.window = document.defaultView;
global.navigator = global.window.navigator;