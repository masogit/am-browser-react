if (process.env.NODE_ENV === 'production') {
  module.exports = require('./store/store-prod');
} else {
  module.exports = require('./store/store-dev');
}
