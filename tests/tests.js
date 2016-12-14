'use strict'

let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');
let request = require('supertest')('http://localhost:3200');
let user = require('../api/user.js');
let bcrypt = require('bcryptjs');
let course = require('../api/course.js');



describe('Tests', function() {
	let token;
	let length;
	let userId;
	let courseId;
	let testId;
	let codeTestId;
	let questionId;
	let questionObj;
	
	function makeCodeQuestion() {
		return new Promise((resolve,reject) => {
			request
				.post('/v2/questions')
				.set('x-access-token', token)
				.send({
					title: "Code Test",
					type: "Code",
					category: "JavaScript", 
					body: "Create a function called add that takes two parameters and returns the value of them added together",
					unitTest: `
						describe("Add", () => {
							it('should add 1 and 2 and return 3', () => {
								expect(add(1,2)).toBe(3);
							});
						});
					`
				})
				.end((err,res) => {
					resolve(res)
				});
		});
	}

	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		let userPassword = bcrypt.hashSync('test',10);
		let userModel = {
			firstName: 'Ryan',
			lastName: 'Christiani',
			email: 'ryan@chalktesttests.js.com',
			password: userPassword,
			admin: true,
			first_sign_up: true,
			instructor: true
		};
		new models.user(userModel).save((err,doc) => {
			userId = doc._id;
			if(err) {
				throw err;
			}
			user.authenticate({
				query: {
					email: 'ryan@chalktesttests.js.com',
					password: 'test'
				},
				params:{},
				body: {}
			} , {
				send(data) {
					token = data.token;
					course.getCourses({},{
						send(courses) {
							courseId = courses.course[0]._id;
							done();
						}
					});
				}
			});
		});
	});

	after((done) => {
		user.removeUser({
			params: {
				id: userId
			},
			body: {}
		}, {
			send(data) {
				mongoose.disconnect();
				done();
			}
		})
	});

	it('should create a test and add it to a course', (done) => {
		request
			.post(`/v2/tests`)
			.set(`x-access-token`,token)
			.send({
				courseId,
				data: {
					title: "Test added to a course"
				}
			})
			.end((err,res) => {
				testId = res.body.test._id;
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.test.course).to.be.a('string');
				expect(res.body.test.created_by).to.not.be('string');
				expect(res.body.test.created_at).to.be.a('number');
				done();
			});
	});

	it('should reject if course is created without courseId', (done) => {
		request
			.post(`/v2/tests`)
			.set(`x-access-token`, token)
			.send({
				data: {
					title: "Should not be added"
				}
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.be(400);
				expect(res.body.error).to.be.a('string');
				expect(res.body.error).to.be.eql('Missing courseId param.');
				done();
			});
	});

	it('should get all the tests', (done) => {
		request
			.get(`/v2/tests`)
			.set(`x-access-token`, token)
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.tests.length).to.be.greaterThan(0);
				done();
			});
	});

	it('should update a test', (done) => {
		request
			.put(`/v2/tests/${testId}`)
			.set(`x-access-token`,token)
			.send({
				title: "Test added to a course Updated"
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.test.title).to.be.eql("Test added to a course Updated");
				done();
			});
	});

	it('should add a question to a test', (done) => {
		request
			.get(`/v2/questions`)
			.set(`x-access-token`,token)
			.end((err,res) => {
				const question = res.body.questions[0];
				questionObj = question;
				questionId = question._id;
				request
					.put(`/v2/tests/${testId}/question`)
					.set(`x-access-token`,token)
					.send({
						questionId
					})
					.end((err,res) => {
						expect(err).to.be(null);
						expect(res.status).to.not.be(404);
						expect(res.status).to.not.be(400);
						expect(res.body.test.questions).to.be.an('array');
						expect(res.body.test.questions[0]._id).to.be.eql(question._id);
						done();
					});
			});
	});

	it('should add a code question', (done) => {
		makeCodeQuestion()
			.then((res) => {
				const question = res.body.question;
				codeTestId = question._id;
				request
					.put(`/v2/tests/${testId}/question`)
					.set(`x-access-token`,token)
					.send({
						questionId: codeTestId
					})
					.end((err,res) => {
						expect(err).to.be(null);
						expect(res.status).to.not.be(400);
						expect(res.body.test.questions).to.be.an('array');
						expect(res.body.test.questions.length).to.be.eql(2);
						done();
					});
			});
	});

	it('should get a single test', (done) => {
		request
			.get(`/v2/tests/${testId}`)
			.set(`x-access-token`, token)
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.test).to.be.an('object');
				done();
			});
	});

	it('should add a test to a user', (done) => {
		request
			.put(`/v2/tests/${testId}/user`)
			.set(`x-access-token`, token)
			.send({
				userId
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.test.users).to.have.length(1);
				request
					.get(`/v1/user/${res.body.test.users[0]}`)
					.set(`x-access-token`,token)
					.end((err,res) => {
						expect(err).to.be(null);
						expect(res.body.user.tests).to.be.an('array');
						expect(res.body.user.tests[0]).to.be.an('object');
						expect(res.body.user.tests[0]._id).to.be.eql(testId);
						done();
					})
			});
	});

	it('should allow a user to take a test', function(done) {
		this.timeout(4000);
		request
			.post(`/v2/tests/${testId}/evaluate`)
			.set(`x-access-token`,token)
			.send({
				userId,
				answers: [
					{
						questionId: questionId,
						answer: questionObj.multiAnswer
					},
					{
						questionId: codeTestId,
						answer: 'function add(a,b){return a + b;}'
					}
				]
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(401);
				expect(res.status).to.not.be(400);
				expect(res.body.user.test_results[0].answers[0]).to.not.be(null);
				expect(res.body.user.test_results[0].answers[0].correct).to.be.ok();
				expect(res.body.user.test_results[0].answers[1]).to.not.be(null);
				console.log(res.body.user.test_results[0].answers[1]);
				expect(res.body.user.test_results[0].answers[1].correct).to.be.ok();
				done();
			});
	});
	
	it('should not remove a single question if the id is wrong', (done) => {
		request
			.delete(`/v2/tests/${testId}/question`)
			.set(`x-access-token`,token)
			.send({
				questionId: '141fh1h3174891'
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.be(400);
				done();
			});
	});

	it('should remove a single question', (done) => {
		request
			.delete(`/v2/tests/${testId}/question`)
			.set(`x-access-token`,token)
			.send({
				questionId
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.test.questions).to.have.length(1);
				done();
			});
	});

	it('should remove a test', (done) => {
		request
			.delete(`/v2/tests/${testId}`)
			.set(`x-access-token`, token)
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.success).to.be(true);
				done();
			});
	});
});