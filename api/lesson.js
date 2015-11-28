'use strict';

let lesson = {};
let models = require('./models/index.js');
let topic = require('./topic.js');

lesson.createLesson = (req,res) => {
	let model = req.body;
	model.created_at = +new Date();
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
	models.lesson.find({_id: lessonId}, {'__v' : 0}, (err,doc) => {
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
	model.updated_at = +new Date();	
	models.lesson.findOne({_id:lessonId}, (err,olddoc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		if(model.revisions === undefined) {
			model.revisions = [];
		}
		model.revisions.push(olddoc.toObject());
		models.lesson.findOneAndUpdate(
			{_id:lessonId},
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
					lesson: doc
				});
			}
		});
	});
};

lesson.addTopic = (req,res) => {
	let topicId = req.params.topicId;
	let lessonId = req.params.lessonId;
	models.lesson.find({_id:lessonId},(err,doc) => {
		let lesson = doc[0];
		lesson.updated_at = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			topic.addLesson(topicId,lessonId).then((result) => {
				lesson.topics.push(topicId);
				lesson.save((err,doc) => {
					res.send({
						lesson: doc
					});
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
			lesson.updated_at = +new Date();
			topic.removeLesson(topicId,lessonId).then(() => {
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
			})
		}
	});
};



module.exports = lesson;











