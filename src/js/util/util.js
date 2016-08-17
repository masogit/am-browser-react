import _ from 'lodash';
const storageName = 'AMB_Storage';

export function hash(obj) {
  let str = JSON.stringify(obj);
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

export function loadSetting(key) {
  if (localStorage && localStorage.getItem(storageName)) {
    let settings = JSON.parse(localStorage.getItem(storageName));
    let param = _.remove(settings, setting => {
      return setting.key == key;
    });
    if (param.length > 0)
      return JSON.parse(param[0].value);
  }
}

export function saveSetting(key, value) {
  const len = 100; // Store 100 settings
  if (localStorage) {
    let settings = localStorage.getItem(storageName) ? JSON.parse(localStorage.getItem(storageName)) : [];
    settings.unshift({key: key, value: JSON.stringify(value)});
    settings.splice(len, (settings.length > len) ? (settings.length - len) : 1);
    localStorage.setItem(storageName, JSON.stringify(settings));
  }
}
