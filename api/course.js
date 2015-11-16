'use strict';

let course = {};
let models = require('./models/index.js');

course.createCourse = (req,res) => {
	let model = req.body;
	model.template = false;
	model.created_at = +new Date();

	new models.course(model.toObject()).save((err,doc) => {
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

course.createTemplate = (req,res) => {
	let model = req.body;
	model.template = true;
	model.created_at = +new Date();
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

course.getTemplates = (req,res) => {
	models.course.find({"template": true},{ '__v': 0} , (err,docs) => {
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

course.getTemplate = (req,res) => {
	let templateId = req.params.templateId;
	models.course.findOne({_id:templateId}, {__v: 0,_id:0},(err,doc) => {
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
	}).populate('lessons');
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
	models.course.find({_id:id}, {'__v': 0},(err,doc) => {
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
	}).populate('lessons');
};

course.updateCourse = (req,res) => {
	let model = req.body;
	let id = req.params.id;

	model.updated_at = +new Date();
	models.course.findOneAndUpdate(
		{ _id:id },
		model,
		{ new: true },
		(err,doc) => {
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

course.removeCourse = (req,res) => {
	let courseId = req.params.courseId;
	models.course.find({_id: courseId},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			doc[0].remove((err) => {
				if(err) {
					res.send({
						error:err
					});
				}
				else {
					res.send({
						course: []
					});
				}
			});	
		}
	});
};

course.addLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	let courseId = req.params.courseId;
	models.course.find({_id: courseId}, (err,doc) => {
		let course = doc[0];
		course.updated_at = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			course.lessons.push(lessonId);
			course.save((err,doc) => {
				res.send({
					course: doc
				});
			});
		}
	});
};

course.removeLesson = (req,res) => {
	let courseId = req.params.courseId;
	let lessonId = req.params.lessonId;
	models.course.find({_id:courseId}, (err,doc) => {
		let course = doc[0];
		course.updated_at = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			let lessonIndex = course.lessons.indexOf(lessonId);
			course.lessons.splice(lessonIndex,1);
			course.save((err,doc) => {
				res.send({
					course: doc
				});
			})
		}
	});
};

module.exports = course;





