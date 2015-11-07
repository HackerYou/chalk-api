'use strict';

let exercise = {};
let models = require('./models/index.js');

exercise.createExercise = (req,res) => {
	let model = req.body;

	model.createdAt = +new Date();
	new models.exercise(model).save((err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				exercise: doc
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

exercise.getExercise = (req,res) => {
	let exerciseId = req.params.exerciseId;
	models.exercise.findOne({_id: exerciseId}, (err, doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				exercise: doc
			});
		}
	});
};

exercise.addTopic = (exerciseId, topicId) => {
	return new Promise((resolve,reject) => {
		
	});
};
exercise.updateExercise = (req,res) => {
	let exerciseId =req.params.exerciseId;
	let model = req.body;
	model.updatedAt = +new Date();
	models.exercise.findOneAndUpdate({_id:exerciseId}, model,{new:true},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				exercise: doc
			});
		}
	});
};




module.exports = exercise;





