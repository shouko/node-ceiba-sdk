var rp = require('request-promise');
var Promise = require('bluebird');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');

var Board = function(course_sn, sn, caption, jar) {
  this.course_sn = course_sn;
  this.sn = sn;
  this.caption = caption;
  this.jar = jar;
  this.posts = [];
};

Board.prototype.fetch = function() {
  var self = this;
  return rp({
    headers: constants.headers,
    jar: self.jar,
    json: true,
    method: 'GET',
    url: urlbuilder.api({
      mode: 'read_board_post',
      board: self.sn,
      course_sn: self.course_sn
    })
  }).then(function(data) {
/*
[
  { sn: '1472583',
    parent: '0',
    author: '',
    cauthor: '',
    attach: 'image.jpeg',
    subject: '',
    content: '',
    post_time: '2016-05-24 05:06:51.55904+08',
    latest_rep: '2016-05-24 12:13:00.497516+08',
    count_rep: '1',
    file_path: '12345.jpeg' }
]
*/
  });
};

Board.prototype.post = function() {

};

module.exports = Board;
