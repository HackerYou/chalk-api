'use strict';

let lesson = {};
let models = require('./models/index.js');

lesson.createLesson = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.lesson(model).save((err) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				lesson: model
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

module.exports = lesson;


