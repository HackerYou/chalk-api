'use strict';

let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');
let media = require('../api/media.js');
let request = require('supertest')('http://localhost:3200');
let user = require('../api/user.js');
let bcrypt = require('bcryptjs');


describe('Media', function() {
	this.timeout(6000);
	let fileName;
	let token;
	let length;
	before((done) => {
		mongoose.connect('mongodb://localhost/notes');
		let userPassword = bcrypt.hashSync('test',10);
		let userModel = {
			firstName: 'Ryan',
			lastName: 'Christiani',
			email: 'ryan@mediaUnitTest.com',
			password: userPassword,
			admin: true,
			first_sign_up: true,
			instructor: true
		};
		models.user(userModel).save((err) => {
			if(err) {
				throw err;
			}
			user.authenticate({
				query: {
					email: 'ryan@mediaUnitTest.com',
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
	after(() => {
		mongoose.disconnect();
	});
	it('should upload a file', (done) => {
		request
			.post('/v1/media')
			.attach('image', __dirname + '/imgs/unnamed.png')
			.set('x-access-token', token)
			.end((err,res) => {
				let data = res.body.media;
				if(err) {
					throw err;
				}
				fileName = data.name;
				expect(data).to.be.an('object');
				expect(data.path).to.be.a('string');
				done();
			});
	});

	it('should return all files', (done) => {
		request
			.get('/v1/media')
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.media).to.be.an('object');
				length = res.body.media.length;
				expect(res.body.media.length).to.be.above(1);
				done();
			});
	});

	it('should remove a file', (done) => {
		request
			.delete('/v1/media/' + fileName )
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.media).to.be.an('array');
				expect(res.body.media).to.be.empty();
				request
					.get('/v1/media')
					.set('x-access-token', token)
					.end((err,res) => {
						expect(res.body.media).to.have.length(length - 1);
						done();
					})
			});
	});
});





