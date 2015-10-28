'use strict';

let expect = require('expect.js');
let lesson = require('../api/lesson.js');
let models = require('../api/models/index.js');
let mongoose = require('mongoose');

describe('Lessons', () => {
	before(() => {
		mongoose.connect('mongodb://localhost/notes');
	});
	after(() => {
		mongoose.disconnect();
	});
	it('should create a lesson', (done) => {
		lesson.createLesson({
			body: {
				'title' : 'Test'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('lesson');
				done();
			}
		});
	});
	it('should return all lessons', (done) => {
		lesson.getLessons({},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson).to.be.an('array');
				expect(data.lesson.length).to.be.above(0);
				done();
			}
		});
	});
});






