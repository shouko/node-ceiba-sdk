var _ = require('lodash');
var constants = require('./constants');

module.exports = function(obj) {
  var url = constants.urls.ceiba_api_base + _.map(obj, function(value, key) {
    return key + '=' + encodeURIComponent(value);
  }).join('&');
  console.log(url);
  return url;
};
