'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let course = require('../api/course.js');
let lesson = require('../api/lesson.js');
let mongoose = require('mongoose');

describe('Courses', () => {
	let courseId;
	let lessonId;
	before((done) => {
		mongoose.connect('mongodb://localhost/notes');

		lesson.createLesson({
			body: {
				title: "Course add lesson"
			}
		}, {
			send(data) {
				lessonId = data.lesson._id;
				done();
			}
		})
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

	it('should add a lesson', (done) => {
		course.addLesson({
			params: {
				lessonId: lessonId,
				courseId: courseId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				expect(data.course.lessons).to.have.length(1);
				done();
			}
		});
	});
	it('should remove a lesson', (done) => {
		course.removeLesson({
			params: {
				lessonId: lessonId,
				courseId: courseId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course.lessons).to.have.length(0);
				done();
			}
		});
	});

	it('should remove a course', (done) => {
		course.removeCourse({
			params: {
				courseId: courseId
			}
		}, {
			send(data) {
				expect(data.course).to.be.empty();
				done();
			}
		});
	});
}); //End of describe






