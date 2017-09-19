'use strict';

let mongoose = require('mongoose');
let config = require('../config.js');
mongoose.connect('mongodb://localhost/notes');
mongoose.Promise = Promise;

module.exports = {
	topic: require('./topic.js'),
	exercise: require('./exercise.js'),
	course: require('./course.js'),
	lesson: require('./lesson.js'),
	announcement: require('./announcement.js'),
	user: require('./user.js'),
	media: require('./media.js'),
	question: require('./question.js'),
	tests: require('./tests.js'),
	issues: require('./issues.js')
};