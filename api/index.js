'use strict';

let mongoose = require('mongoose');
let config = require('../config.js');
if(process.env.NODE_ENV === 'production') {
	mongoose.connect(`mongodb://${config.db_user}:${config.db_pass}@localhost/notes`);
}
else {
	mongoose.connect('mongodb://localhost/notes');
}
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