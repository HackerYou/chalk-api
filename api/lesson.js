'use strict';

let lesson = {};
let models = require('./models/index.js');

lesson.createLesson = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.lesson(model).save((err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				lesson: doc
			});
		}
	});
};

lesson.removeLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	models.lesson.find({_id:lessonId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			let lesson = doc[0];
			lesson.remove((err) => {
				if(err) {
					res.send({
						error: err
					});
				}
				else {
					res.send({
						lesson: []
					});
				}
			});
		}
	});
};

lesson.getLessons = (req,res) => {
	models.lesson.find({},{'__v' : 0}, (err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				lesson: docs
			});
		}
	});
};

lesson.getLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	models.lesson.find({_id: lessonId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				lesson: doc[0]
			});
		}
	}).populate('topics');
};

lesson.updateLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	let model = req.body;

	models.lesson.findOneAndUpdate({_id:lessonId},model,{new:true}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				lesson: doc
			});
		}
	});
};

lesson.addTopic = (req,res) => {
	let topicId = req.params.topicId;
	let lessonId = req.params.lessonId;
	models.lesson.find({_id:lessonId},(err,doc) => {
		let lesson = doc[0];
		lesson.updatedAt = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			lesson.topics.push(topicId);
			lesson.save((err,doc) => {
				res.send({
					lesson: doc
				});
			});
		}

	});
};

lesson.removeTopic = (req,res) => {
	let topicId = req.params.topicId;
	let lessonId = req.params.lessonId;
	models.lesson.find({_id:lessonId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			let lesson = doc[0];
			let topicIndex = lesson.topics.indexOf(topicId);
			lesson.topics.splice(topicId,1);
			lesson.updatedAt = +new Date();
			lesson.save((err,doc)=>{
				if(err) {
					res.send({
						error: err
					});
				}
				else {
					res.send({
						lesson: doc
					});
				}
			})
		}
	});
};



module.exports = lesson;











