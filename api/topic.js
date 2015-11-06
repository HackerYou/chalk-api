'use strict';

let topic = {};
let models = require('./models/index.js');

topic.createTopic = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.topic(model).save((err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: doc
			});
		}
	});
};

topic.getTopics = (req,res) => {
	models.topic.find({},{'__v': 0}, (err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: docs
			});
		}
	});
};

topic.getTopic = (req,res) => {
	let topicId = req.params.topicId;
	models.topic.find({_id:topicId}, {'__v': 0},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: doc[0]
			});
		}
	});
};

topic.updateTopic = (req,res) => {
	let topicId = req.params.topicId;
	let model = req.body;
	model.updatedAt = +new Date();
	models.topic.findOneAndUpdate({_id:topicId},model,{new:true}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: doc
			});
		}
	});
};

topic.addLesson = (topicId, lessonId) => {
	return new Promise((resolve,reject) => {
		models.topic.findOne({_id:topicId}, (err,doc) => {
			if(err) {
				reject(err);
			}
			doc.lessons.push(lessonId);
			doc.save((err) => {
				if(err) {
					reject(err);
				}
				resolve(doc);
			});
		});
	});
};


topic.removeTopic = (req, res) => {
	let topicId = req.params.topicId;
	models.topic.findOne({_id:topicId},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			doc.remove((err) => {
				if(err) {
					res.send({
						error: err
					});
				}
				else {
					res.send({
						topic: []
					});
				}
			});
		}
	});
};

topic.addExercise = (req,res) => {
	let topicId = req.params.topicId;
	let exerciseId = req.params.exerciseId;

	models.topic.findOne({_id: topicId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			doc.exercises.push(exerciseId);
			doc.save((err, newDoc) => {
				if(err) {
					res.send({
						error: err
					});
				}
				else {
					res.send({
						topic: newDoc
					});
				}
			});
		}
	});
};

topic.removeExercise = (req,res) => {
	let topicId = req.params.topicId;
	let exerciseId = req.params.exerciseId;

	models.topic.findOne({_id: topicId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			let exerciseIndex = doc.exercises.indexOf(exerciseId);
			doc.exercises.splice(exerciseIndex,1);
			doc.save((err,newDoc) => {
				res.send({
					topic: newDoc
				});
			});
		}
	});
};


module.exports = topic;






