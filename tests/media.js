'use strict';

let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');
let media = require('../api/media.js');
let request = require('supertest')('http://localhost:3200');


describe('Media', () => {
	let fileName;
	it('should upload a file', (done) => {
		request
			.post('/v1/media')
			.attach('image', __dirname + '/imgs/unnamed.png')
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

	it('should remove a file', (done) => {
		request
			.delete('/v1/media/' + fileName )
			.end((err,res) => {
				expect(res.body.media).to.be.an('array');
				expect(res.body.media).to.have.length(0);
				done();
			});
	});
});





