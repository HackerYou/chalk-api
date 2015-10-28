'use strict';

let course = {};
let models = require('./models/index.js');

course.createCourse = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.course(model).save((err) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				course: model
			});
		}
	});
};

course.getCourses = (req,res) => {
	models.course.find({},{'__v': 0}, (err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				course: docs
			});
		}
	});
};

module.exports = course;





