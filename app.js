var rp = require('request-promise');
var Promise = require('bluebird');
var iconv = require('iconv-lite');
var _ = require('lodash');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');
var Semester = require('./semester');

var Ceiba = function(username, password, cb) {
  var self = this;
  self.current_semester = 0;
  self.semester = [];
  self.login(username, password).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      json: true,
      method: 'GET',
      url: urlbuilder({
        mode: 'semester'
      })
    });
  }).then(function(data) {
    data.semester.forEach(function(semester) {
      self.semester.push(new Semester(semester.semester, self.jar));
      if(semester.now) {
        self.current_semester = semester.semester;
        self.semester[self.semester.length - 1].init(data);
      }
    });
  }).then(function() {
    return rp({
      jar: self.jar,
      encoding: null,
      method: 'GET',
      url: constants.urls.ceiba_web_home
    });
  }).then(function(result) {
    cb(null, result);
  }).catch(function(e) {
    cb(e, null);
  });
};

Ceiba.prototype.login = function(username, password) {
  var self = this;
  self.jar = rp.jar();
  self.headers = constants.headers;
  return rp({
    headers: self.headers,
    jar: self.jar,
    method: 'GET',
    url: constants.urls.ceiba_web_home
  }).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: constants.urls.ceiba_api_entry
    });
  }).then(function() {
    self.headers.referer = constants.urls.ceiba_sso_callback_endpoint;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: constants.urls.ntu_sso_entry
    });
  }).then(function() {
    self.headers.referer = constants.urls.ntu_sso_entry;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'POST',
      resolveWithFullResponse: true,
      simple: false, // statusCode 302 is expected
      url: constants.urls.ntu_sso_login,
      form: {
        user: username,
        pass: password
      }
    });
  }).then(function(response){
    if(response.statusCode == 302 && response.headers.location.indexOf(constants.urls.ceiba_sso_callback_prefix) === 0){
      // success
      self.headers.referer = constants.urls.ntu_sso_login;
      return rp({
        headers: self.headers,
        jar: self.jar,
        method: 'GET',
        url: response.headers.location
      });
    }else{
      throw new Error('bad auth');
    }
  }).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: constants.urls.ceiba_sso_callback_endpoint
    });
  });
}

Ceiba.prototype.get = function(params) {
  var self = this;
  return rp({
    headers: self.headers,
    jar: self.jar,
    json: true,
    method: 'GET',
    url: urlbuilder(params),
  });
};

module.exports = Ceiba;
