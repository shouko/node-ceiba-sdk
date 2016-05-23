var rp = require('request-promise');
var Promise = require('bluebird');
var iconv = require('iconv-lite');
var constant = require('./constant');

var Ceiba = function(username, password) {
  var self = this;
  self.jar = rp.jar();
  self.headers = constant.headers;
  rp({
    headers: self.headers,
    jar: self.jar,
    method: 'GET',
    url: constant.urls.ceiba_web_home
  }).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: constant.urls.ceiba_api_entry
    });
  }).then(function() {
    self.headers.referer = constant.urls.ceiba_sso_callback;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: constant.urls.ntu_sso_entry
    });
  }).then(function() {
    self.headers.referer = constant.urls.ntu_sso_entry;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'POST',
      resolveWithFullResponse: true,
      simple: false, // statusCode 302 is expected
      url: constant.urls.ntu_sso_login,
      form: {
        user: username,
        pass: password
      }
    });
  }).then(function(response){
    if(response.statusCode == 302 && response.headers.location.indexOf('https://ceiba.ntu.edu.tw/ChkSessLib.php?sess=') === 0){
      // success
      self.headers.referer = constant.urls.ntu_sso_login;
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
      url: constant.urls.ceiba_sso_callback
    });
  }).then(function() {
    return rp({
      headers: self.headers,
      jar: self.jar,
      json: true,
      method: 'GET',
      url: constant.urls.ceiba_api_home
    });
  }).then(function(body) {
    console.log("API response", body);
  }).then(function() {
    return rp({
      jar: self.jar,
      encoding: null,
      method: 'GET',
      url: constant.urls.ceiba_web_home
    });
  }).then(function(result) {
    console.log("CEIBA home", iconv.decode(new Buffer(result), 'Big5'));
    console.log(self.jar);
  }).catch(function(e) {
    console.log('error', e);
  });
}

module.exports = Ceiba;
