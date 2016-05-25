var _ = require('lodash');
var constants = require('./constants');

module.exports = {
  api: function(obj) {
    var url = constants.urls.ceiba_api_base + _.map(obj, function(value, key) {
      return key + '=' + encodeURIComponent(value);
    }).join('&');
    console.log(url);
    return url;
  },
  download: function(course_sn, type, fn) {
    return constants.urls.ceiba_course_root + course_sn + '/' + type + '/' + encodeURI(fn);
  }
};
