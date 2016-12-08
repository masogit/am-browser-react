import _ from 'lodash';
const storageName = 'AMB_Storage';

export function bodyToMapData(body) {
  let link = Object.assign({}, body);
  let categories = [];
  let links = [];
  let index = 0;
  // add root
  let id = (Math.random() + 1).toString(36).substring(7);
  categories.push({ id: index.toString(), items: [{id, node: link.label}] });
  // add sub link
  if (link.links && link.links.length > 0)
    addCategory(categories, links, link.links, id, index + 1);
  return {categories, links};
}

function addCategory(categories, links, bodyLinks, parentId, index) {
  let category = categories[index] || { id: index.toString(), items: [] };
  categories.push(category);
  bodyLinks.forEach((link) => {
    let childId = (Math.random() + 1).toString(36).substring(7);
    category.items.push({id: childId, node: link.sqlname});
    links.push({parentId, childId});
    // check sub links
    if (link.body.links && link.body.links.length > 0)
      addCategory(categories, links, link.body.links, childId, index + 1);
  });
}

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

export function updateValue(event, props) {
  const {state, callback,
    name = event.target ? event.target.name : event.name,
    type = event.target ? event.target.type : event.type} = props;

  let val = props.val;
  if (!val) {
    val = event.target ? event.target.value : event.value;
    if (type == 'range' || type == 'number') {
      val = parseInt(val);
    } else if (type == 'checkbox') {
      val = event.target.checked;
    }
  }

  if (name.indexOf('.') > -1) {
    const nameParts = name.split('.');
    nameParts.reduce((state, key, index) => {
      if (index == nameParts.length - 1) {
        state[key] = val;
      }
      return state[key];
    }, state);
  } else {
    state[name] = val;
  }

  if (typeof callback == 'function') {
    callback();
  }
}
