'use strict';

let expect = require('expect.js');
let user = require('../api/user.js');
let mongoose = require('mongoose');
let models = require('../api/models/index.js');
let bcrypt = require('bcryptjs');

describe("User", function() {
	let mockUser;
	let password = 'test';
	let userEmail = 'ryan@test.com';
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
		models.user(userModel).save((err) => {
			if(err) {
				throw err;
			}
			done();
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
				emails: 'ryan@hackeryou.com,ryan@hackeryou.com'
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
			body: mockUser
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.user.updated_at).to.be.a('number');
				done();

			}
		});
	});

	it('should get instructors', (done) => {
		user.getInstructors({
			params: {},
			body: {}
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
				expect(data).to.be.an('object');
				expect(data.success).to.be.eql(true);
				expect(data.token).to.be.a('string');
				done();
			}
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



