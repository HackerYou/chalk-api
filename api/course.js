'use strict';

let course = {};
let models = require('./models/index.js');
let user = require('./user.js');
//TODO: Some duplication in methods
//Maybe we don't need a method for courses and templates
//Some required, not all.
course.createCourse = (req,res) => {
	let model = req.body;
	model.template = false;
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
	models.course.find({"template": true},{ '__v': 0,students:0} , (err,docs) => {
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
	let templateId = req.params.id;
	models.course.findOne({_id:templateId}, {__v: 0,_id:0,students:0},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			models.course.populate(doc,{
				path: 'sections',
			},(err,populatedDocs) => {
				if(err) {
					res.send({
						error: err
					});
					return;
				}
				models.section.populate(populatedDocs.sections,{
					path: 'lessons'
				},(err,populatedLesson) => {
					if(err) {
						res.send({
							error: err
						});
						return;
					}
					res.send({
						course: populatedDocs
					});
				});
			});
		}
	}).populate('sections');
};

course.updateTemplate = (req,res) => {
	let templateId = req.params.id;
	let model = req.body;

	model.updated_at = +new Date();

	models.course.findOneAndUpdate(
		{_id:templateId},
		model,
		{new: true},
		(err,doc) => {
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
	models.course.findOne({_id:id}, {'__v': 0},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			models.course.populate(doc,{
				path: 'sections students',
			},(err,populatedDocs) => {
				if(err) {
					res.send({
						error: err
					});
					return;
				}
				models.section.populate(populatedDocs.sections,{
					path: 'lessons'
				},(err,populatedLesson) => {
					if(err) {
						res.send({
							error: err
						});
						return;
					}
					res.send({
						course: populatedDocs
					});
				});
			});
		}
	});
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
	let courseId = req.params.id;
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

course.addSection = (req,res) => {
	let courseId = req.params.courseId;
	let model = req.body;
	new models.section(model).save((err,sectionDoc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		models.course.findOne({_id: courseId},{__v:0},(err,doc) => {
			doc.sections.push(sectionDoc._id);
			doc.save((err, savedDoc) => {
				models.section.populate(savedDoc, {path: 'sections'}, (err,courseWSections) => {
					if(err) {
						res.send({
							error: err
						});
						return;
					}
					res.send({
						course: savedDoc
					});

				});
			});
		});
	});
};

course.removeSection = (req,res) => {
	let courseId = req.params.courseId;
	let sectionId = req.params.sectionId;

	models.course.findOne({_id:courseId},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		let sectionIndex = doc.sections.indexOf(sectionId);
		doc.sections.splice(sectionIndex,1);
		doc.save((err,newDoc) => {
			if(err) {
				res.send({
					error: err
				});
				return;
			}
			res.send({
				course: doc
			});
		});
 
	});
};

course.addLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	let sectionId = req.params.sectionId;
	models.section.findOne({_id: sectionId}, (err,doc) => {
		let section = doc;
		section.updated_at = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			section.lessons.push(lessonId);
			section.save((err,doc) => {
				if(err) {
					res.send({
						error: err
					});
				}
				else {
					models.section.populate(doc,{path:'lessons'},(err, sectionWLesson) => {
						res.send({
							section: sectionWLesson
						});
					});
				}
			});
		}
	});
};

course.removeLesson = (req,res) => {
	let sectionId = req.params.sectionId;
	let lessonId = req.params.lessonId;
	models.section.findOne({_id:sectionId}, (err,doc) => {
		let section = doc;     
		section.updated_at = +new Date();
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			let lessonIndex = section.lessons.indexOf(lessonId);
			section.lessons.splice(lessonIndex,1);
			section.save((err,doc) => { 
				res.send({
					section: doc
				});
			})
		}
	});
};

course.addUser = (req,res) => {
	let userId = req.params.userId;
	let courseId = req.params.courseId;

	models.course.findOne({_id: courseId},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		doc.students.push(userId);
		doc.save((err) => {
			if(err) {
				res.send({
					error: err
				})
				return;
			}
			user.addCourse(userId, courseId).then((res) => {
				models.course.populate(doc, {path: 'students'},(err,courseWStudents) => {
					if(err) {
						res.send({
							error: err
						});
						return;
					}
					res.send({
						course: courseWStudents
					});
				});
			},(err) => {
				res.send({
					error: err
				});
			});
		});

	});
};

module.exports = course;





