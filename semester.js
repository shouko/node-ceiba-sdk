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
    url: urlbuilder({
      mode: 'semester',
      semester: this.name
    })
  }).then(function(data) {
    return self.init(data);
  });
};

Semester.prototype.init = function(data) {
  var semester = _.filter(data.semester, _.matches(now: 1));
  if(semester.length == 0) {
    throw new Error('Unknown semester');
  }
  semester[0].semester
  var course_map = {};
  semester.grid.forEach(function(course) {
    if(course.course_sn == 0) return;
    course_map[course.course_sn] = this.courses.length;
    this.courses.push(new Course(course, jar));
  });
  semester.calendar.forEach(function(course_time) {
    if(!course_map[course_time.course_sn]) return;
    this.courses[course_map[course_time.course_sn]].add_time({
      day: course_time.day,
      slot: course_time.slot
    });
  });
}

module.exports = Semester;
