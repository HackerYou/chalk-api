'use strict';

let user = {};
let models = require('./models/index.js');
let bcrypt = require('bcryptjs');
let config = require('../config.js');
let jwt = require('jsonwebtoken');
let mandrill = require('mandrill-api');
let mandrill_client = new mandrill.Mandrill(config.mandrillKey);

let simplePassword = (length) => {
	let chars = 'abcdefghijklmnopqrstuvwxyz01234567890';
	let password = '';

	for(let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
};

let sendEmail = (templateName,options) => {
	let emailOptions = {
		message : {
			"subject": options.subject,
			"from_email": "info@hackeryou.com",
			"from_name": "HackerYou",
			"to": [{
				"email": options.email,
				"type": "to"
			}]
		},
		messageContent : [
			{
				"name": "email",
				"content": options.email
			},
			{
				"name" : "password",
				"content" : options.password
			},
			{
				"name" : "url",
				"content" : options.url
			}
		],
		templateName: templateName
	};
	return new Promise((resolve, reject) => {
		mandrill_client.messages.sendTemplate({
			"template_name" : emailOptions.templateName,
			"template_content" : emailOptions.messageContent,
			"message": emailOptions.message,
			"async": false,
			"ip_pool": 'Main Pool'
		}, 
		function(result) {
			if(result[0].status === 'sent') {
				resolve({
					status: 'success',
					message: 'Email Sent'
				});
			}
			else {
				reject({
					status: 'failed',
					message: `Error ${result[0].reject_reason}`
				});
			}
		}, function(err) {
			reject({
				status: 'failed',
				message: err
			});
		});	
	});
};

user.createUser = (emails) => {
	emails = emails.split(',');
	let users = emails.map((email) => {
		let password = simplePassword(10);
		let model = {
			email: email,
			password: (() => {
				return bcrypt.hashSync(password,10);
			})(),
			created_at: +new Date(),
			first_sign_up: true
		};
	 	return sendEmail(config.mandrillTemplate.signup,{
			email: email,
			password: password,
			url: config.site_url,
			subject: 'Welcome to HackerYou!'
		}).then((data) => {
			return new models.user(model).save();
		}, (emailError) => {
			console.log(emailError);
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
		}
		else {
			res.send({
				user: doc
			});
		}
	}).populate('courses');
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
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		let tempPass = simplePassword(10);
		sendEmail(config.mandrillTemplate.forgotpassword,{
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
	let email = req.query.email;
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
						expiresIn: "2 days"
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





