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
	
	delete model._id;

	models.lesson.findOne({_id:lessonId}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		// //Store old version of the doc first
		// if(model.revisions === undefined) {
		// 	model.revisions = [];
		// }

		// model.revisions.push(doc.toObject());

		//Set it as updated
		model.updated_at = +new Date();	
		
		Object.assign(doc,model);

		//Flatten the topics to be the _id
		if(model.topics !== undefined) {
			doc.topics = model.topics.map( (t) => {
				return t._id.toString();
			});
		}
		//Merge new model with old doc

		//Save the old doc
		doc.save((err,savedLesson) => {

			if(err) {
				res.send({
					error: err
				});
				return;
			}
			//Populate the document with the topics
			models.lesson.populate(savedLesson,{path: 'topics'}, (err, populatedDoc) =>{
				if(err) {
					res.send({
						error: err
					});
					return;
				}
				//Send it on its way.
				res.send({
					lesson: populatedDoc
				});
			});
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
					models.lesson.populate(doc,{path: 'topics'},(err,lessonWTopics) => {
						res.send({
							lesson: lessonWTopics
						});
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











