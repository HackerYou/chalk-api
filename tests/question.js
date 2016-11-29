'use strict'

let question = require('../api/question.js');
let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');
let request = require('supertest')('http://localhost:3200');
let user = require('../api/user.js');
let bcrypt = require('bcryptjs');

describe('Questions', () => {
	let token;
	let length;
	let questionId;

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

	it('should exist', () => {
		expect(question).to.ok();
	});

	it('should create a question', (done) => {
		request
			.post('/v2/questions')
			.send({
				title: 'Sample test',
				type: 'Code',
				category: 'JS',
				body: 'This is a sample test, can you do the test?!'
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
				expect(data.question.type).to.be.eql('Code');
				expect(data.question.category).to.be.eql('JS');
				expect(data.question.body).to.be.eql('This is a sample test, can you do the test?!');
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
				answer: '2',
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
						lable: '9',
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

	it('should remove a question', (done) => {
		request
			.delete(`/v2/questions/${questionId}`)
			.set('x-access-token', token)
			.end((err,res) => {
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question).to.be.eql(null);
				done();
			});
	});

});
