/**
 * Created by huling on 7/26/2016.
 */

import Rest from '../../src/js/util/grommet-rest-promise';
var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

// hack grommet-rest-promise, to avoid the csrf-token issue
const mockFun = (uri) => _superagent2.default.get(uri);

Rest.get = mockFun;
Rest.head = mockFun;
Rest.post = mockFun;
Rest.patch = mockFun;
Rest.del = mockFun;
Rest.put = mockFun;

export default Rest;
