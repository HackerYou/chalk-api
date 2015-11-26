'use strict';

let exercise = {};
let models = require('./models/index.js');

exercise.createExercise = (req,res) => {
	let model = req.body;

	model.created_at = +new Date();
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
	models.exercise.findOne({_id: exerciseId},{__v:0}, (err, doc) => {
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
		models.exercise.findOne({_id:exerciseId},(err,doc) => {
			if(err) {
				reject(err);
			}
			doc.topics.push(topicId);
			doc.save((err,newDoc) => {

				if(err){
					reject(err);
				}
				resolve(doc);
			}); 
		});
	});
};

exercise.removeTopic = (exerciseId,topicId) => {
	return new Promise((resolve,reject) => {
		models.exercise.findOne({_id:exerciseId},(err,doc) => {
			if(err) {
				reject(err);
			}
			let topicIndex = doc.topics.indexOf(topicId);
			doc.updated_at = +new Date();
			doc.topics.splice(topicIndex,1);
			doc.save((err) => {
				if(err) {
					reject(err);
				}
				resolve(doc);
			});
		});
	});
};

exercise.updateExercise = (req,res) => {
	let exerciseId =req.params.exerciseId;
	let model = req.body;
	model.updated_at = +new Date();
	models.exercise.findOne({_id:exerciseId},(err,olddoc) => {
		model.revisions.push(olddoc.toObject());
		models.exercise.findOneAndUpdate(
			{_id:exerciseId},
			model,
			{new:true},
			(err,doc) => {
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
	});
};

exercise.removeExercise = (req,res) => {
	let exerciseId = req.params.exerciseId;

	models.exercise.findOne({_id:exerciseId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			doc.remove((err) => {
				res.send({
					exercise: []
				});
			});
		}
	});
};



module.exports = exercise;





