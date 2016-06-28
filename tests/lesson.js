'use strict';

let expect = require('expect.js');
let lesson = require('../api/lesson.js');
let topic = require('../api/topic.js');
let models = require('../api/models/index.js');
let mongoose = require('mongoose');

function createTopic(cb) {
	topic.createTopic({
		body: {
			title: 'Test Topic 1'
		}
	}, {
		send(data) {
			cb(data);
		}
	})
}

describe('Lessons', () => {
	let lessonId;
	let topicId;
	let mockLesson;
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
				'title' : 'Test',
				'body' : 'This is a test'
			}
		}, {
			send(data) {
				lessonId = data.lesson._id;
				mockLesson = data.lesson;
				expect(data).to.be.an('object');
				expect(data.lesson.body).to.be.a('string');
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
		mockLesson.title = "New lesson title";
		lesson.updateLesson({
			params: {
				lessonId: lessonId
			},
			body: mockLesson
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.lesson.updated_at).to.be.a('number');
				expect(data.lesson.title).to.be.eql('New lesson title');
				expect(data.lesson.revisions).to.be.an('array');
				expect(data.lesson.revisions).to.have.length(1);
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
				expect(data.lesson.topics[0]).to.be.an('object');
				done();
			}
		});
	});

	it('should add another topic', (done) => {
		createTopic((data) => {
			lesson.addTopic({
				params: {
					topicId: data.topic._id,
					lessonId: lessonId
				}
			}, {
				send(lessonData) {

					expect(lessonData.lesson.topics).to.have.length(2);
					done();
				}
			});
		});
	});

	it('should reorder topics in lesson', (done) => {
		lesson.getLesson({
			params: {
				lessonId: lessonId
			}
		}, {
			send(data) {
				let lastTopic = data.lesson.topics.splice(1,1);
				let topicTitle = lastTopic[0].title;
				data.lesson.topics.unshift(lastTopic[0]);

				lesson.updateLesson({
					params: {
						lessonId: lessonId
					},
					body: data.lesson
				}, {
					send(lessonData) {
						expect(lessonData.lesson.topics[0].title).to.be.eql(topicTitle);
						done();
					}
				});
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
				expect(data.lesson.topics).to.have.length(1);
				models.topic.findOne({_id:topicId},(err,doc) => {
					expect(doc.lessons).to.have.length(0);	
					done();
				});
			}
		});
	});


	it('should add an exercise link to a lesson', (done) => {
		mockLesson.exercise_link = 'http://hackeryou.com';
		lesson.updateLesson({
			params: {
				lessonId: lessonId
			},
			body: mockLesson
		}, {
			send(data) {
				expect(data.lesson.exercise_link).to.be.eql('http://hackeryou.com');
				done();
			}
		})
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






