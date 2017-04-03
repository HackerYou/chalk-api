'use strict';

let expect = require('expect.js');
let user = require('../api/user.js');
let mongoose = require('mongoose');
let models = require('../api/models/index.js');
let bcrypt = require('bcryptjs');
let request = require('supertest')('http://localhost:3200');
const courseApi = require('../api/course.js');

xdescribe("User", function() {
	let mockUser;
	let password = 'test';
	let userEmail = `ryan+${+new Date()}@hackeryou.com`;
	let token;
	let course;
	let lesson;
	let userId;
	//Emails take to long!
	//Have to disable timeout
	this.timeout(0);
	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		let userPassword = bcrypt.hashSync('test',10);
		let userModel = {
			firstName: 'Ryan',
			lastName: 'Christiani',
			email: userEmail,
			password: userPassword,
			admin: true,
			first_sign_up: true,
			instructor: true
		};
		models.user(userModel).save((err,doc) => {
			if(err) {
				console.error(err);
			}
			courseApi.createTemplate({
				body: {
					"title": "New Template"
				}
			}, {
				send(data) {
					models.course.findOne({},(err,courseDoc) => {
						course = courseDoc;
						models.lesson.findOne({},(err,lessonDoc) => {
							lesson = lessonDoc;
							done();
						});
					});
				}
			});
		});
	});
	after((done) => {
		mongoose.disconnect();
		done();
	});
	it('should create a user', (done) => {
		user.addUser({
			params:{},
			body:  {
				emails: 'ryan@hackeryou.com'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.message).to.be.eql('success');
				expect(data.usersAdded).to.be.eql(1);
				done();
			}
		});
	});

	it('should add multiple users', (done) => {
		user.addUser({
			params: {},
			body: {
				emails: 'ryan@hackeryou.com,ryan@testingahackeryouwebsite.com'
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.message).to.be.eql('success');
				expect(data.usersAdded).to.be.eql(2);
				expect(data.students).to.have.length(2);
				done();
			}
		});
	});

	it('should get all users', (done) => {
		user.getUsers({
			params: {},
			body: {}
		}, {
			send(data) {
				mockUser = data.user[0];
				expect(data).to.be.an('object');
				expect(data.user).to.be.an('array');
				expect(data.user[0].email).to.be.a('string');
				done();
			}
		});
	});

	it('should get a single user', (done) => {
		user.getUser({
			params: {
				id: mockUser._id
			},
			body: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.user.email).to.be.a('string');	
				expect(data.user._id).to.be.eql(mockUser._id);
				done();
			}
		});
	});

	it('should update a single user', (done) => {
		mockUser.firstName = 'Ryan',
		mockUser.lastName = 'Christiani'
		user.updateUser({
			params: {
				id: mockUser._id
			},
			body: mockUser.toObject()
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.user.updated_at).to.be.a('number');
				done();

			}
		});
	});

	it('should get instructors', (done) => {
		user.getUsers({
			params: {},
			query: {
				instructor: true
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.user[0].instructor).to.be.eql(true);
				done();
			}
		});
	});

	it('should send a reset password', (done) => {
		user.resetPassword({
			params: {
				email: 'ryan@hackeryou.com'
			},
			body: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.status).to.be.eql('success');
				expect(data.message).to.be.eql('Email Sent');
				done();
			}
		});
	});

	
	it('should remove a user', (done) => {
		user.removeUser({
			params: {
				id: mockUser._id
			},
			body: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.user).to.be.an('array');
				expect(data.user).to.have.length(0);
				done();
			}
		});
	});

	it('should authenticate a user', (done) => {
		user.authenticate({
			query: {
				email: userEmail,
				password: password
			},
			params:{},
			body: {}
		}, {
			send(data) {
				token = data.token;
				expect(data).to.be.an('object');
				expect(data.success).to.be.eql(true);
				expect(data.token).to.be.a('string');
				done();
			}
		});
	});

	it('should favorite a classroom', (done) => {
		request
			.post('/v2/user/favoriteClassroom')
			.send({ 'classroomId': course._id })
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.user).to.be.an('object');
				expect(res.body.user.favoriteClassrooms).to.be.an('array');
				expect(res.body.user.favoriteClassrooms).to.contain(course._id.toString());
				done();
			});
	});

	it('should not favorite a malformed classroom id', (done) => {
		request
			.post('/v2/user/favoriteClassroom')
			.send({ 'classroomId': 'ryan smells'})
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.error).to.contain('Classroom ID does not exist.');
				done();			
			});
	});

	it('should not remove a malformed classroom id from a users favorite classrooms', (done) => {
		request
			.delete('/v2/user/favoriteClassroom')
			.send({ 'classroomId': 'blah'})
			.set('x-access-token', token)
			.end((err, res) => {
				expect(res.body.error).to.contain('Unable to find classroom in favorites.');
				done();
			});
	});

	it('should remove a classroom from a users favorites', (done) => {
		request
			.delete('/v2/user/favoriteClassroom')
			.send({ 'classroomId': course._id })
			.set('x-access-token', token)
			.end((err, res) => {
				expect(res.body.user.favoriteClassrooms).to.not.contain(course._id);
				done();
			});
	});

	it('should favorite a lesson', (done) => {
		request
			.post(`/v1/user/course/${course._id}/lesson/${lesson._id}/favorite`)
			.set('x-access-token', token)
			.end((err, res) => {
				expect(res.body.user).to.be.an('object');
				expect(res.body.user.favorites).to.be.an('object');
				expect(res.body.user.favorites[course._id].lessons[0]._id).to.be.eql(lesson._id.toString());
				done();
			});
	});

	it('should remove a favorite lesson', (done) => {
		request
			.delete(`/v1/user/course/${course._id}/lesson/${lesson._id}/favorite`)
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.user).to.be.an('object');
				expect(res.body.user.favorites[course._id].lessons).to.have.length(0);
				done();
			});
	});


	it('should not exist', (done) => {
		user.authenticate({
			query: {
				email: 'drew@hackeryou.com',
				password: 'thisisatest'
			},
			params:{},
			body: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.success).to.be.eql(false);
				expect(data.message).to.be.eql('User does not exist');
				done();
			}
		});
	});

	it('should not authenticate if password is wrong', (done) => {
		user.authenticate({
			query: {
				email: userEmail,
				password: 'thai8901'
			},
			param:{},
			body: {}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.success).to.be.eql(false);
				expect(data.message).to.be.eql('Authentication failed');
				done();
			}
		});
	});

});



