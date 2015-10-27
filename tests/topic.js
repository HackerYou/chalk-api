'use strict';

let topic = require('../api/topic.js');
let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');


describe('Topics', () => {
	before(() => {
		mongoose.connect('mongodb://localhost/notes');
	});
	after(() => {
		models.topic.find({'title': 'test'}, (err,doc) => {
			doc[0].remove();
			mongoose.disconnect();
		});
	});
	it('should create a new topic, and return an object', (done) => {
		topic.createTopic({ body: {title:'test'} }, {
			send(data) {
				expect(data).to.be.an('object');
				done();
			}
		});
	});
	it('should return topics', (done) => {
		topic.getTopics({},{
			send(data) {
				expect(data.topic.length).to.be.above(0);
				done();
			}
		});
	});
});





