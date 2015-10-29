'use strict';

let course = {};
let models = require('./models/index.js');

course.createCourse = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.course(model).save((err,doc) => {

		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				course: doc
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

course.getCourse = (req,res) => {
	let id = req.params.id;
	models.course.find({_id:id}, (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				course: doc
			});
		}
	});
};

course.updateCourse = (req,res) => {
	let model = req.body;
	let id = req.params.id;

	model.updatedAt = +new Date();
	models.course.findOneAndUpdate(
		{ _id:id },
		model,
		{ new: true },(err,doc) => {
		if(err){
			res.send({
				error: err
			});
		}
		else {
			res.send({
				course: doc
			});
		}
	});
};

module.exports = course;





