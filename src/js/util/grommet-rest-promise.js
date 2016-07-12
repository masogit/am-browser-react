'use strict';
import * as Types from '../constants/ActionTypes';
Object.defineProperty(exports, "__esModule", {
  value: true
});

var isProduction = (process.env.NODE_ENV === 'production');

var cookies = require('js-cookie');

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

var _headers = {'Accept': 'application/json'}; // (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var _timeout = 10000; // 10s
var Promise = require("bluebird");
var Request = _superagent2.default.Request;
Promise.config({
  // Enable cancellation.
  cancellation: true
});

const store = require('../store');
const {init} = require('../actions/system');
/**
 *
 * Add promise support for grommet REST.
 *
 * Call .promise() to return promise for the request
 *
 * @method then
 * @return {Bluebird.Promise}
 */
Request.prototype.promise = function () {
  var req = this;

  return new Promise(function (resolve, reject, onCancel) {
    req.end(function (err, res) {
      // global error message
      if (err) {
        if (err.status == 401 || err.status == 403) {
          store.default.dispatch(init('', ''));
        }
        let msg = err.response && err.response.text || err.message;
        if (msg && err.status == 400) {
          store.default.dispatch({type: Types.RECEIVE_ERROR, msg: msg});
        }
        if (msg && err.status == 500) {
          store.default.dispatch({type: Types.RECEIVE_ERROR, msg: "Server error."});
          console.log(msg);
        }
      }
      if (typeof res !== "undefined" && res.status > 400) {
        err.message = 'cannot ' + req.method + ' ' + req.url + ' (' + res.status + ')';
        reject(err);
      } else if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
    onCancel(function () {
      req.abort();
    });

  });
};

/**
 *
 * Make superagent requests Promises/A+ conformant
 *
 * Call .then([onFulfilled], [onRejected]) to register callbacks
 *
 * @method then
 * @param {function} [onFulfilled]
 * @param {function} [onRejected]
 * @return {Bluebird.Promise}
 */
Request.prototype.then = function () {
  var promise = this.promise();
  return promise.then.apply(promise, arguments);
};

// convert params to string, to deal with array values
function buildQueryParams(params) {
  var result = [];
  for (var property in params) {
    if (params.hasOwnProperty(property)) {
      var value = params[property];
      if (null !== value && undefined !== value) {
        if (Array.isArray(value)) {
          for (var i = 0; i < value.length; i++) {
            result.push(property + '=' + value[i]);
          }
        } else {
          result.push(property + '=' + value);
        }
      }
    }
  }
  return result.join('&');
}

exports.default = {
  setTimeout: function setTimeout(timeout) {
    _timeout = timeout;
  },
  setHeaders: function setHeaders(headers) {
    _headers = headers;
  },
  setHeader: function setHeader(name, value) {
    _headers[name] = value;
  },
  head: function head(uri, params) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.head(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.query(buildQueryParams(params));
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  },
  get: function get(uri, params) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.get(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.query(buildQueryParams(params));
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  },
  patch: function patch(uri, data) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.patch(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.send(data);
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  },
  post: function post(uri, data) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.post(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.send(data);
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  },
  put: function put(uri, data) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.put(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.send(data);
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  },
  del: function del(uri) {
    _headers['csrf-token'] = cookies.get('csrf-token');

    var op = _superagent2.default.del(uri);
    if (!isProduction) {
      op.withCredentials();
    }
    op.timeout(_timeout);
    op.set(_headers);
    return op;
  }
};
module.exports = exports.default;

