'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let course = require('../api/course.js');
let mongoose = require('mongoose');

describe('Courses', () => {
	let courseId;
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
				courseId = data.course._id;
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
	
	it('should get a specific course', (done) => {
		course.getCourse({params: { id: courseId } }, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course.length).to.be.eql(1);
				done();
			}
		});
	});
	
	it('should update the courses', (done) => {
		course.updateCourse({
			params: {id:courseId},
			body: {
			     "_id": courseId,
			     "title": "updated",
			     "createdAt": 1446064502200,
			     "lessons": []
			   }
		},{
			send(data) {
				expect(data.course.title).to.be.eql('updated');
				expect(data.course.updatedAt).to.be.a('number');
				done();
			}
		});
	});


}); //End of describe






