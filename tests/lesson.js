'use strict';

let expect = require('expect.js');
let lesson = require('../api/lesson.js');
let topic = require('../api/topic.js');
let models = require('../api/models/index.js');
let mongoose = require('mongoose');

describe('Lessons', () => {
	let lessonId;
	let topicId;
	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		topic.createTopic({
			body: {
				title: 'Test topic'
			}
		}, {
			send(data) {
				topicId = data.topic._id;
				done();
			}
		});
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
				lessonId = data.lesson._id;
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

	it('should get a specific lesson', (done) => {
		lesson.getLesson({
			params: {
				lessonId: lessonId
			}
		},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('lesson');
				done();
			}
		});
	});

	it('should update a lesson', (done) => {
		lesson.updateLesson({
			params: {
				lessonId: lessonId
			},
			body: {
				title: 'New lesson title'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson.title).to.be.eql('New lesson title');
				done();
			}
		})
	});

	it('should add a topic', (done) => {
		lesson.addTopic({
			params: {
				topicId: topicId,
				lessonId: lessonId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson.topics).to.have.length(1);
				done();
			}
		});
	});

	it('should remove a topic', (done) => {
		lesson.removeTopic({
			params: {
				topicId: topicId,
				lessonId: lessonId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson.topics).to.have.length(0);
				done();
			}
		});
	});

	it('should remove a lesson', (done) => {
		lesson.removeLesson({
			params: {
				lessonId: lessonId
			}
		},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson).to.be.empty();
				done();
			}	
		});
	});

});






