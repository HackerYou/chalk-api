'use strict';

let user = {};
let models = require('./models/index.js');
let bcrypt = require('bcryptjs');
let config = require('../config.js');
let jwt = require('jsonwebtoken');
const sendgrid = require('sendgrid')(config.sendGridKey);

let simplePassword = (length) => {
	let chars = 'abcdefghijklmnopqrstuvwxyz01234567890';
	let password = '';

	for(let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
};

let sendEmail = (templateName,options) => {
	const newEmail = new sendgrid.Email();
	newEmail.addTo(options.email);
	newEmail.subject = options.subject;
	newEmail.from = 'info@hackeryou.com';
	newEmail.setFromName('HackerYou');

	newEmail.setSubstitutions({
		'-url-': ["https://notes.hackeryou.com"],
		'-email-': [options.email],
		'-password-': [options.password]
	});

	newEmail.body = 'Enjoy!';
	newEmail.text = 'Enjoy!';

	newEmail.addFilter('templates', 'enable', 1);
	newEmail.addFilter('templates', 'template_id', templateName);


	return new Promise((resolve,reject) => {
		sendgrid.send(newEmail,(err,data) => {
			if(err) {
				reject({
					status: 'failed',
					message: `Error: ${err}`
				});
				return;
			}
			resolve({
				status: 'success',
				message: 'Email Sent'
			});
		});
	});
};

user.createUser = (emails) => {
	// TODO: Add check to make sure user email does not exist already.
	emails = emails.split(',');
	
	let users = emails.map((email) => {
		email = email.trim();
		let password = simplePassword(10);
		let model = {
			email: email,
			password: (() => {
				return bcrypt.hashSync(password,10);
			})(),
			created_at: +new Date(),
			first_sign_up: true
		};
	 	return sendEmail('0e47535b-3c02-4f75-a13f-533b461f885d',{
			email: email,
			password: password,
			url: config.site_url,
			subject: 'Welcome to HackerYou!'
		}).then((data) => {
			return new models.user(model).save();
		}, (emailError) => {
			console.log({
				message: `Failed to send email to ${email}`,
				mailerErrorMsg: emailError
			});
		});
	});
	return users;
};

user.addUser = (req,res) => {
	let emails = req.body.emails;
	Promise.all(user.createUser(emails)).then((data) => {
		let students = data.map((student) => {
			return student._id;
		});
		res.send({
			message: 'success',
			usersAdded: students.length,
			students: students
		});
	},(err) => {
		res.send({
			error: err
		});
	});
};

user.getUsers = (req,res) => {
	let query = req.query ? req.query: {};

	models.user.find(query,{password:0,__v:0},(err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				user: docs
			});
		}
	});
};

user.getUser = (req,res) => {
	let id = req.params.id;

	models.user.findOne({_id:id},{__v:0,password:0},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		res.send({
			user: doc
		});
	}).populate('courses tests');
};

user.updateUser = (req,res) => {
	let id = req.params.id;
	let model = req.body;
	model.updated_at = +new Date();
	model.first_sign_up = false;
	if(model.password !== undefined) {
		model.password = bcrypt.hashSync(model.password, 10);
	}
	models.user.findOne({_id:id},(err,doc) => {

		doc.update({$set: model}, (err) =>{
			if(err) {
				res.send({
					error: err
				});
			}
			else {
				models.user.findOne({_id:id}, {__v:0,password: 0},(err,newdoc) => {
					if(err) {
						res.send({
							error: err
						});
					}
					else {
						res.send({
							user: newdoc
						});
					}
				});
			}
		});
	});
};

user.resetPassword = (req,res) => {
	let email = req.params.email;
	models.user.findOne({email:email}, (err,doc) => {
		if(err || doc === null) {
			if(doc === null) {
				res.send({
					error: 'Email does not exist.'
				});
			}
			else {
				res.send({
					error: err
				});
			}
			return;
		}
		let tempPass = simplePassword(10);
		sendEmail('3fa5a4f6-aca9-4cff-9294-dbb1fe20490b',{
			email: doc.email,
			password: tempPass,
			url: config.site_url,
			subject: 'Password reset!'
		}).then((data) => {
			doc.password = bcrypt.hashSync(tempPass,10);
			doc.first_sign_up = true;
			doc.save((err) => {
				if(err) {
					res.send({
						error: err
					});
					return;
				}
				res.send({
					status: 'success',
					message: 'Email Sent'
				});
			});
		}, (emailError) => {
			res.send({
				status: 'failed',
				message: emailError.message
			});
		});
	});
};

user.removeUser = (req,res) => {
	let id = req.params.id;

	models.user.findOne({_id:id}, (err,doc) => {
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
						user: []
					});
				}
			});
		}
	});
};	

user.authenticate = (req,res) => {
	let email = req.query.email.toLowerCase();
	let password = req.query.password;

	models.user.findOne({email:email},(err,doc) => {
		if(err || !doc) {
			res.send({
				success: false,
				message: 'User does not exist'
			});
		}
		else {
			bcrypt.compare(password,doc.password, (err,result) => {
				if(err || !result) {
					res.send({
						success: false,
						message: 'Authentication failed',
						token: ''
					});
				}
				else {
					let token = jwt.sign({
						name: `${doc.firstName} ${doc.lastName}`,
						admin: (() => {
							return doc.admin !== undefined ? doc.admin : false
						})(),
						instructor: (() => {
							return doc.instructor !== undefined ? doc.instructor : false
						})(),
						user_id: doc._id
					}, 
					config.secret, 
					{
						expiresIn: "5 days"	
					});
					res.send({
						success: true,
						message: 'Authentication successful',
						token: token,
						user_id: doc._id
					});
				}
			});
		}
	});
};

user.addCourse = (id, courseId) => {
	return new Promise((resolve,reject) => {
		models.user.findOne({_id:id},(err,doc) =>{
			if(err){
				reject(err);
				return;
			}
			if(!doc.courses) {
				doc.courses = [];
			}
			doc.courses.push(courseId);
			doc.save((err) => {
				if(err) {
					reject(err);
					return;
				}
				resolve();
			});

		});
	});
};

user.removeCourse = (studentId,courseId) => {
	return new Promise((resolve,reject) => {
		models.user.findOne({_id: studentId}, (err,doc) => {
			if(err) {
				reject(err);
			}
			let courseIndex = doc.courses.indexOf(courseId);
			doc.courses.splice(courseIndex,1);
			doc.save((err) => {
				resolve();
			});
		});
	});
}

user.favoriteLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	let courseId = req.params.courseId;
	let userId = req.decodedUser.user_id;
	models.user.findOne({ _id: userId}, { password: 0,__v:0} , (err,doc) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		if(!doc.favorites) {
			doc.favorites = {};
		}
		if(!doc.favorites[courseId]) {
			doc.favorites[courseId] = {
				lessons: []
			};
		}
		models.lesson.findOne({_id:lessonId},{__v:0,revisions: 0},(err,lessonDoc) => {
			if(err) {
				res.send({
					error: err
				});
				return;
			}

			doc.favorites[courseId].lessons.push(lessonDoc);

			doc.markModified('favorites');
			
			doc.save((err,newUser) => {
				if(err) {
					res.send({
						error: err
					});
					return;
				}
				res.send({
					user: newUser
				});
			});
		});
	});
};

user.removeFavoriteLesson = (req,res) => {
	let lessonId = req.params.lessonId;
	let courseId = req.params.courseId;
	let userId = req.decodedUser.user_id;

	models.user.findOne({_id: userId},(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}

		let lessonIndex = ((userDoc) => {
			let index;
			userDoc.favorites[courseId].lessons.forEach((lesson,i) => {
				if(lesson._id.toString() === lessonId.toString()) {
					index = i;
				}
			});
			return index;
		})(doc);

		doc.favorites[courseId].lessons.splice(lessonIndex,1);
		//Because it is a Mixed type you need to prompt mongoose 
		//that it has changed
		doc.markModified('favorites');
		
		doc.save((err,savedUser,affected) => {
			if(err) {
				res.send({
					error: err
				});
				return;
			}
			res.send({
				user: savedUser
			});
		});
	});
};


module.exports = user;





