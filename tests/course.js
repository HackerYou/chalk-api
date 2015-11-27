'use strict';

let expect = require('expect.js');
let models = require('../api/models/index.js');
let course = require('../api/course.js');
let lesson = require('../api/lesson.js');
let mongoose = require('mongoose');
let request = require('supertest');


describe('Courses', () => {
	let mockCourse;
	let lessonId;
	let template;
	let templateId;
	let sectionId;
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


	it('should create a template', (done) => {
		// request
		// 	.post('/v1/course/template')
		// 	.send({
		// 		"title": "New Template"
		// 	})
		// 	.end((err,res) => {
		// 		if(err) {
		// 			throw err;
		// 		}
		// 		res.to.be.an('object');
		// 		res.course.template.to.be(true);
		// 		done();
		// 	});
		course.createTemplate({
			body: {
				"title": "New Template"
			}
		}, {
			send(data) {
				templateId = data.course._id;
				expect(data).to.be.an('object');
				expect(data.course.template).to.be(true);
				done();
			}
		});
	});

	it('should get all templates', (done) => {
		course.getTemplates({}, 
		{
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course[0].template).to.be.eql(true);
				done();
			} 
		})
	});

	it('should get a template', (done) => {
		course.getTemplate({
			params: {
				id: templateId
			}
		}, {
			send(data) {
				template = data.course;
				expect(data).to.be.an('object');
				expect(data.course.template).to.be.eql(true);
				done();
			}
		})
	});

	it('should update a template', (done) => {
		template.title = 'Updated Template';
		course.updateTemplate({
			params: {
				id: templateId
			},
			body: template
		}, {
			send(data) {
				done();
			}
		});
	});

	it('should create a course', (done) => {
		let courseFromTemplate = Object.assign({},template.toJSON(), {
			'term': 'Summer 2015',
			'description': 'Test description'
		});
		course.createCourse({
			body: courseFromTemplate
		},{
			send(data) {
				mockCourse = data.course;
				expect(data).to.be.an('object');
				expect(data).to.have.key('course');
				expect(data.course.sections).to.be.an('array');
				expect(data.course.students).to.be.an('array');
				expect(data.course.template).to.be.eql(false);
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
		course.getCourse({params: { id: mockCourse._id } }, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course.length).to.be.eql(1);
				done();
			}
		});
	});
	
	it('should update the courses', (done) => {
		mockCourse.title = 'updated';
		course.updateCourse({
			params: {id:mockCourse._id},
			body: mockCourse.toJSON()
		},{
			send(data) {
				expect(data.course.title).to.be.eql('updated');
				expect(data.course.updated_at).to.be.a('number');
				done();
			}
		});
	});

	it('should add a section', (done) => {
		course.addSection({
			params: {
				courseId: mockCourse._id
			},
			body: {
				title: 'New section'	
			}
		}, {
			send(data) {
				sectionId = data.course.sections[0];
				expect(data.course.sections).to.have.length(1);
				done();
			}
		});
	});

	it('should add a lesson to a section', (done) => {
		course.addLesson({
			params: {
				lessonId: lessonId,
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('section');
				expect(data.section.lessons).to.have.length(1);
				done();
			}
		});
	});

	it('should remove a lesson', (done) => {
		course.removeLesson({
			params: {
				lessonId: lessonId,
				sectionId: sectionId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.section.lessons).to.have.length(0);
				done();
			}
		});
	});

	it('should remove a course', (done) => {
		course.removeCourse({
			params: {
				id: mockCourse._id
			}
		}, {
			send(data) {
				expect(data.course).to.be.empty();
				done();
			}
		});
	});

	it('should remove a template', (done) => {
		expect(template.template).to.be.eql(true);
		course.removeCourse({
			params: {
				id: templateId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.course).to.be.an('array');
				expect(data.course).to.have.length(0);
				done();
			}
		})
	});

}); //End of describe






