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
			email: 'ryan@mediaunittest.com',
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
					email: 'ryan@mediaunittest.com',
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
				expect(res.body.media.length).to.be.above(1);
				done();
			});
	});

	it('should return only 10 images', (done) => {
		request
			.get('/v1/media')
			.set('x-access-token', token)
			.query({offset: 0})
			.query({limit: 10})
			.end((err, res) => {
				const body = res.body;
				expect(body.media).to.be.an('array');
				expect(body.media.length).to.be.within(0,10);
				done();
			});
	});

	it('should return only 3 images', (done) => {
		request
			.get('/v1/media')
			.set('x-access-token', token)
			.query({offset: 3})
			.query({limit: 3})
			.end((err,res) => {
				const body = res.body;
				expect(body.media).to.be.an('array');
				expect(body.media).to.have.length(3);
				done();
			});
	});

	it('should search the title of a file', (done) => {
		request
			.post('/v1/media')
			.attach('image', __dirname + '/imgs/d20.png')
			.set('x-access-token', token)
			.end((err,result) => {
				request
					.get('/v1/media/search')
					.query({name: 'd20'})
					.set('x-access-token', token)
					.end((err,res) => {
						let body = res.body;
						expect(body.media).to.be.an('array');
						done();
					});
			});
	});

	it('should remove a file', (done) => {
		request
			.delete('/v1/media/' + fileName )
			.set('x-access-token', token)
			.end((err,res) => {
				expect(res.body.media).to.be.an('array');
				expect(res.body.media).to.be.empty();
				done();
			});
	});


});





