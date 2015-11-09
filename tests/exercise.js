'use strict';

let exercise = require('../api/exercise.js');
let mongoose = require('mongoose');
let expect = require('expect.js');
let models = require('../api/models/index.js');

describe('Exercise', () => {
	let exerciseId;
	let newExercise;
	before(() => {
		mongoose.connect('mongodb://localhost/notes');
	});
	after(() => {
		mongoose.disconnect();	
	});
	it('should create an exercise', (done) => {
		exercise.createExercise({body: { title: 'test' } }, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data).to.have.key('exercise');
				exerciseId = data.exercise._id;
				newExercise = data.exercise;
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

	it('should return a specific exercise', (done) => {
		exercise.getExercise({
			params: {
				exerciseId: exerciseId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.exercise._id).to.be.eql(exerciseId);
				done();	
			}
		})
	});

	it('should update an exercise', (done) => {
		newExercise.title = 'Updated Exercise';
		exercise.updateExercise({
			params: {
				exerciseId: exerciseId
			},
			body: newExercise
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.exercise.updatedAt).to.have.a('number');
				expect(data.exercise.title).to.be.eql('Updated Exercise');
				done();
			}
		});
	});

	it('should remove an exercise', (done) => {
		exercise.removeExercise({
			params: {
				exerciseId: exerciseId
			}
		}, {
			send(data) {
				expect(data).to.be.an('object');
				expect(data.exercise).to.have.length(0);
				done();
			}
		})
	});
});




