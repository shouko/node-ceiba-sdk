var rp = require('request-promise');
var Promise = require('bluebird');
var iconv = require('iconv-lite');

var headers = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'tw.edu.ntu.ceiba',
  'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; Google Nexus 4 - 4.2.2 - API 17 - 768x1280 Build/JDQ39E) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
};

var urls = {
  ceiba_api_entry: 'https://ceiba.ntu.edu.tw/course/f03067/app/info_web.php?api_version=1.1',
  ntu_sso_entry: 'https://web2.cc.ntu.edu.tw/p/s/login2/p6.php?url=https://ceiba.ntu.edu.tw/ChkSessLib.php',
  ntu_sso_login: 'https://web2.cc.ntu.edu.tw/p/s/login2/p1.php',
  ceiba_sso_callback: 'https://ceiba.ntu.edu.tw/ChkSessLib.php',
  ceiba_api_home: 'https://ceiba.ntu.edu.tw/course/f03067/app/login.php?api=1&&mode=semester',
  ceiba_web_home: 'https://ceiba.ntu.edu.tw/student/index.php'
};

var Ceiba = function(username, password) {
  var self = this;
  self.jar = rp.jar();
  self.headers = headers;
  rp({
    headers: self.headers,
    jar: self.jar,
    method: 'GET',
    url: urls.ceiba_api_entry
  }).then(function() {
    self.headers.referer = urls.ceiba_sso_callback;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'GET',
      url: urls.ntu_sso_entry
    });
  }).then(function() {
    self.headers.referer = urls.ntu_sso_entry;
    return rp({
      headers: self.headers,
      jar: self.jar,
      method: 'POST',
      resolveWithFullResponse: true,
      simple: false, // statusCode 302 is expected
      url: urls.ntu_sso_login,
      form: {
        user: username,
        pass: password
      }
    });
  }).then(function(response){
    if(response.statusCode == 302 && response.headers.location.indexOf('https://ceiba.ntu.edu.tw/ChkSessLib.php?sess=') === 0){
      // success
      self.headers.referer = urls.ntu_sso_login;
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
      json: true,
      method: 'GET',
      url: urls.ceiba_api_home
    })
  }).then(function(body) {
    console.log("API response", body);
  }).then(function() {
    return rp({
      jar: self.jar,
      encoding: null,
      method: 'GET',
      url: urls.ceiba_web_home
    });
  }).then(function(result) {
    console.log("CEIBA home", iconv.decode(new Buffer(result), 'Big5'));
  }).catch(function(e) {
    console.log('error', e);
  });
}

module.exports = Ceiba;
