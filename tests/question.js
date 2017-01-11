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
	let htmlQuestionId;
	let reactQuestionId;

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
				expect(data.question.type).to.be.eql('multiple choice');
				expect(data.question.category).to.be.eql('js');
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
				category: 'HTML',
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
				expect(res.body.question.type).to.be.eql("multiple choice");
				expect(res.body.question.category).to.be.eql("js");
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
						it('should add your numbers together', () => {
							expect(add(1,2)).toBe(3);
						});
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

	
	it('should add a HTML test', (done) => {
		request
			.post('/v2/questions')
			.set('x-access-token', token)
			.send({
				title: "HTML Test",
				type: "Code",
				category: "HTML", 
				body: "Create an unordered list that has four list elements in it",
				unitTest: `
					describe("HTML", () => {
						it('should contain 4 lis', () => {
							expect(render(React.createElement(Element)).find('li').length).toBe(4);
						});
					});
				`
			})
			.end((err,res) => {
				htmlQuestionId = res.body.question._id;
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question.title).to.be.eql("HTML Test");
				done();
			});
	});

	it('should add a React test', (done) => {
		request
			.post('/v2/questions')
			.set('x-access-token', token)
			.send({
				title: "React Test",
				type: "Code",
				category: "React", 
				body: "Create a React Component called Header that is a header with an h1 in it that displays the title from a prop called title",
				unitTest: `
					describe("React", () => {
						it('should contain the title "This is a title"', () => {
							const wrapper = shallow(<Header title={"This is a title"}/>)
							expect( wrapper.contains([<h1>This is a title</h1>]) ).toBe(true);
						});
					});
				`
			})
			.end((err,res) => {
				reactQuestionId = res.body.question._id;
				expect(err).to.be(null);
				expect(res.status).to.not.be(404);
				expect(res.status).to.not.be(400);
				expect(res.body.question.title).to.be.eql("React Test");
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

	it('should let you dry run a question', function(done) {
		this.timeout(5000);
		request
			.post(`/v2/questions/${codeQuestionId}/dryrun`)
			.set(`x-access-token`,token)
			.set(`Content-Type`, `application/json`)
			.set(`Accept`,`application/json`)
			.send({
				answer: `function add(a,b) {return a + b}`
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.not.be(400);
				expect(res.status).to.not.be(404);
				expect(res.body.results).to.be.an('object');
				done();
			});
	});

	it('should dry run the HTML test', function(done) {
		this.timeout(5000);
		request
			.post(`/v2/questions/${htmlQuestionId}/dryrun`)
			.set(`x-access-token`,token)
			.set(`Content-Type`, `application/json`)
			.send({
				answer: `
					<ul>
						<li>Test List</li>
						<li>Test List 2</li>
						<li>Test List 3</li>
						<li>Test List 4</li>
					</ul>
				`
			})
			.end((err,res) => {
				console.log(res.body);
				expect(err).to.be.eql(null);
				expect(res.status).to.not.be(400);
				expect(res.status).to.be(200);
				expect(res.body.results).to.be.an('object');
				expect(res.body.results.success).to.be(true);
				done();
			});
	});

	it('should dry run a React test', function(done) {
		this.timeout(5000);
		request
			.post(`/v2/questions/${reactQuestionId}/dryrun`)
			.set(`x-access-token`,token)
			.set(`Content-Type`,`application/json`)
			.send({
				answer: `
					class Header extends React.Component {
						render() {
							return (
								<header>
									<h1>{this.props.title}</h1>
								</header>
							)
						}
					}
				`
			})
			.end((err,res) => {
				expect(err).to.be(null);
				expect(res.status).to.be(200);
				expect(res.body.results).to.be.an('object');
				expect(res.body.results.success).to.be(true);
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
				request
					.delete(`/v2/questions/${htmlQuestionId}`)
					.set(`x-access-token`,token)
					.end((err,res) => {
						expect(err).to.be.eql(null);
						expect(res.status).to.be(200);
						done();
					});
			});
	});

});
