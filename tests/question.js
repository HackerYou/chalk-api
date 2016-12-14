'use strict'

let question = require('../api/question.js');
let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');
let request = require('supertest')('http://localhost:3200');
let user = require('../api/user.js');
let bcrypt = require('bcryptjs');
let fs = require('fs');

describe('Questions', function() {
	let token;
	let length;
	let questionId;
	let codeQuestionId;

	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		let userPassword = bcrypt.hashSync('test',10);
		let userModel = {
			firstName: 'Ryan',
			lastName: 'Christiani',
			email: 'ryan@questionstests.js.com',
			password: userPassword,
			admin: true,
			first_sign_up: true,
			instructor: true
		};
		new models.user(userModel).save((err) => {

			if(err) {
				throw err;
			}
			user.authenticate({
				query: {
					email: 'ryan@questionstests.js.com',
					password: 'test'
				},
				params:{},
				body: {}
			} , {
				send(data) {

					token = data.token;
					done();
				}
			});
		});
	});

	after((done) => {
		mongoose.disconnect();
		done();
	});

	it('should exist', (done) => {
		expect(question).to.ok();
		done();
	});

	it('should create a question', (done) => {
		request
			.post('/v2/questions')
			.send({
				title: 'Sample test',
				type: 'Multiple Choice',
				category: 'JS',
				body: 'This is a sample test, can you do the test?!',
				multiAnswer: 2
			})
			.set('x-access-token', token)
			.end((err,res) => {
				const data = res.body;
				questionId = data.question._id;
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.be(200);
				expect(data.question).to.be.an('object');
				expect(data.question.title).to.be.eql('Sample test');
				expect(data.question.type).to.be.eql('Multiple Choice');
				expect(data.question.category).to.be.eql('JS');
				expect(data.question.body).to.be.eql('This is a sample test, can you do the test?!');
				done();
			});
	});

	it('should get all the questions', (done) => {
		request
			.get('/v2/questions')
			.set('x-access-token', token)
			.end((err, res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.status).to.be(200);
				expect(res.body.questions).to.be.an('array');
				done();
			});
	});

	it('should get a specific question', (done) => {
		request
			.get(`/v2/questions/${questionId}`)
			.set('x-access-token', token)
			.end((err,res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question).to.be.an('object');
				expect(res.body.question.title).to.be.eql('Sample test');
				done();
			});
	});

	it('should add multiple choice questions', (done) => {
		request
			.post('/v2/questions')
			.set('x-access-token', token)
			.send({
				title: 'Muti choice test',
				type: 'Multiple Choice',
				body: 'What is 1 + 1?',
				multiAnswer: '2',
				multiChoice: [
					{
						value: '2',
						label: '2'
					},
					{
						value: '5',
						label: '5'
					},
					{
						label: '9',
						value: '9'
					}
				]
			})
			.end((err,res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question).to.be.an('object');
				expect(res.body.question.multiChoice).to.have.length(3);
				done();
			})
	});

	it('should update a question', (done) => {
		request
			.put(`/v2/questions/${questionId}`)
			.set('x-access-token', token)
			.send({
				title: "Updated sample test title"
			})
			.end((err,res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question.title).to.be.eql("Updated sample test title");
				expect(res.body.question.type).to.be.eql("Multiple Choice");
				expect(res.body.question.category).to.be.eql("JS");
				done();
			});
	});

	it('should add code and a unit test', (done) => {
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
						expect(add(1,2)).toBe(3);
					});
				`
			})
			.end((err,res) => {
				codeQuestionId = res.body.question._id;
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question.title).to.be.eql("Code Test");
				done();
			});
	});

	it('should get questions by type', (done) => {
		request
			.get(`/v2/questions?type=Code`)
			.set(`x-access-token`,token)
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(400);
				expect(res.body.questions[0].type).to.be.eql('Code');
				done();
			});
	});

	it('should remove a question', (done) => {
		request
			.delete(`/v2/questions/${codeQuestionId}`)
			.set('x-access-token', token)
			.end((err,res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.status).to.be(200);
				done();
			});
	});

});
