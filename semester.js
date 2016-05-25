var rp = require('request-promise');
var Promise = require('bluebird');
var iconv = require('iconv-lite');
var _ = require('lodash');
var urlbuilder = require('./urlbuilder');
var constants = require('./constants');
var Course = require('./course');

var Semester = function(name, jar) {
  this.name = name;
  this.jar = jar;
  this.courses = [];
};

Semester.prototype.fetch = function() {
  var self = this;
  return rp({
    headers: constants.headers,
    jar: self.jar,
    json: true,
    method: 'GET',
    url: urlbuilder.api({
      mode: 'semester',
      semester: this.name
    })
  }).then(function(data) {
    return self.init(data);
  });
};

Semester.prototype.init = function(data) {
  var self = this;
  var semester = _.filter(data.semester, _.matches({now: 1}));
  if(semester.length == 0) {
    throw new Error('Unknown semester');
  }
  semester[0].semester;
  var course_map = {};
  data.grid.forEach(function(course) {
    if(course.course_sn == 0) return;
    course_map[course.course_sn] = self.courses.length;
    self.courses.push(new Course(course, self.jar));
  });
  data.calendar.forEach(function(course_time) {
    if(!course_map[course_time.course_sn]) return;
    self.courses[course_map[course_time.course_sn]].add_time({
      day: course_time.day,
      slot: course_time.slot
    });
  });
  return self;
};

Semester.prototype.get_course = function(param) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var index = 0;
    if(Math.abs(param) != param) {
      index = _.findIndex(self.courses, { sn: param });
    }
    if(self.courses[index].ready) {
      return resolve(self.courses[index]);
    }
    self.courses[index].fetch().then(resolve);
  });
};

module.exports = Semester;
