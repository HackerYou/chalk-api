'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let course = require('../api/course.js');
let mongoose = require('mongoose');

describe('Courses', () => {
	before(() => {
		mongoose.connect('mongodb://localhost/notes');
	});
	after(() => {
		mongoose.disconnect();
	});
	it('should create a course', (done) => {
		course.createCourse({
			body: {
				'title' : 'test'
			}
		},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				done();
			}
		});
	});
	it('should return all courses', (done) => {
		course.getCourses({},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				expect(data.course.length).to.be.above(0);
				expect(data.course).to.be.an('array');
				done();
			}
		});
	});
	
	
}); //End of describe






