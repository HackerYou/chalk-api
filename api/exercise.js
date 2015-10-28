'use strict';

let exercise = {};
let models = require('./models/index.js');

exercise.createExercise = (req,res) => {
	let model = req.body;

	model.createdAt = +new Date();
	new models.exercise(model).save((err) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				exercise: model
			});
		}
	});
};

exercise.getExercises = (req,res) => {
	models.exercise.find({},{'__v': 0}, (err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				exercise: docs
			});
		}
	});
};

module.exports = exercise;





