var rp = require('request-promise');
var Promise = require('bluebird');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');
var Board = require('./board');

var Course = function(data, jar) {
  this.jar = jar;
  this.cname = data.crs_cname;
  this.ename = data.crs_ename;
  this.sn = data.course_sn;
  this.timetable = [];
  this.contents = [];
  this.grades = [];
  this.homeworks = [];
  this.bulletin = [];
  this.boards = [];
};

Course.prototype.add_time = function(course_time) {
  this.timetable.push(course_time);
};

Course.prototype.fetch = function() {
  var self = this;
  return rp({
    headers: constants.headers,
    jar: self.jar,
    json: true,
    method: 'GET',
    url: urlbuilder.api({
      mode: 'course',
      course_sn: this.sn
    })
  }).then(function(data) {
    console.log(data);
    self.update_contents(data.contents, data.content_files);
    self.update_grades(data.course_grade);
    self.update_homeworks(data.homeworks);
    self.update_bulletin(data.bulletin);
    if(!data.boards) self.boards = false;
  });
};

Course.prototype.update_contents = function(contents, content_files) {
  if(typeof(contents) == 'undefined' || typeof(content_files) == 'undefined') return;
  var self = this;
  var content_map = {};
  self.contents = [];
  contents.forEach(function(content) {
    content_map[content.syl_sn] = self.contents.length;
    content.files = [];
    self.contents.push(content);
  });
  content_files.forEach(function(content_file) {
    self.contents[content_map[content_file.syl_sn]].files.push(content_file.file_name);
  });
};

Course.prototype.update_grades = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  self.grades = [];
  data.forEach(function(row) {
    self.grades.push(row);
  });
};

Course.prototype.update_homeworks = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  data.forEach(function(row) {
    self.homeworks.push(row);
  });
};

Course.prototype.update_bulletin = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  self.bulletin = [];
  data.forEach(function(row) {
    if(row.b_link == 'http://') row.b_link = false;
    self.bulletin.push(row);
  });
};

Course.prototype.fetch_boards = function() {
  var self = this;
  return rp({
    headers: constants.headers,
    jar: self.jar,
    json: true,
    method: 'GET',
    url: urlbuilder.api({
      mode: 'read_board',
      course_sn: this.sn,
      board: 0
    })
  }).then(function(data) {
    self.boards = [];
    data.forEach(function(board) {
      self.boards.push(new Board(self.sn, board.sn, board.caption, self.jar));
    });
  });
}

Course.prototype.get_boards = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if(self.boards.length != 0) {
      resolve(self.boards);
    } else {
      self.fetch_boards.then(resolve);
    }
  });
};

module.exports = Course;
