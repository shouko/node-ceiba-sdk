var rp = require('request-promise');
var Promise = require('bluebird');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');
var async = require('async');

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
  this.board = [];
};

Course.prototype.add_time = function(course_time) {
  this.timetable.push(course_time);
};

Course.prototype.fetch = function() {
  var self = this;
  rp({
    headers: constants.headers,
    jar: self.jar,
    method: 'GET',
    url: urlbuilder({
      mode: 'course',
      course_sn: this.sn
    })
  }).then(function(data) {
    self.parse_contents(data.contents);
    self.parse_grades(data.course_grade);
    self.parse_homeworks(data.homeworks);
    self.parse_bulletin(data.bulletin);
  });
};

Course.prototype.parse_contents = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  var content_map = {};
  data.contents.forEach(function(content) {
    content_map[content.syl_sn] = self.contents.length;
    content.files = [];
    self.contents.push(content);
  });
  data.content_files.forEach(function(content_file) {
    self.contents[content_map[content_file.syl_sn]].files.push(content_file.file_name);
  });
};

Course.prototype.parse_grades = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  // TODO
};

Course.prototype.parse_homeworks = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  // TODO
};

Course.prototype.parse_bulletin = function(data) {
  if(typeof(data) == 'undefined') return;
  var self = this;
  // TODO
};

module.exports = Course;
