var rp = require('request-promise');
var Promise = require('bluebird');
var iconv = require('iconv-lite');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');

var Ceiba = function(username, password) {
  var self = this;
  self.jar = rp.jar();
  self.headers = constants.headers;
  rp({
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
  }).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      json: true,
      method: 'GET',
      url: urlbuilder({
        mode: 'semester'
      })
    });
  }).then(function(body) {
    console.log("API response", body);
  }).then(function() {
    return rp({
      jar: self.jar,
      encoding: null,
      method: 'GET',
      url: constants.urls.ceiba_web_home
    });
  }).then(function(result) {
    console.log("CEIBA home", iconv.decode(new Buffer(result), 'Big5'));
    console.log(self.jar);
  }).catch(function(e) {
    console.log('error', e);
  });
};

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
