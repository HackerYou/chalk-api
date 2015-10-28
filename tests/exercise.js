'use strict';

let exercise = require('../api/exercise.js');
let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');

describe('Exercise', () => {
	before(() => {
		mongoose.connect('mongodb://localhost/notes');
	});
	after(() => {
		models.exercise.find({'title':'test'}, (err,doc) => {
			doc[0].remove();
		});
		mongoose.disconnect();	
	});
	it('should create an exercise', (done) => {
		exercise.createExercise({body: { title: 'test' } }, {
			send(data) {
				expect(data).to.be.an('object');
				done();
			}
		});
	});
	it('should return all exercises', (done) => {
		exercise.getExercises({},{
			send(data) {
				expect(data).to.be.an('object');
				expect(data.exercise.length).to.be.above(0);
				done();
			}
		})
	});
});




