'use strict'

const tests = {};
const models = require('./models');
const testRunner = require('./testRunner.js');

tests.createTest = (req,res) => {
	const model = req.body.data;
	const course = req.body.courseId;
	if(course === undefined) {
		res.status(400)
			.send({
				error: 'Missing courseId param.'
			});
			return;
	}
	model.created_at = +new Date();
	model.created_by = req.decodedUser.user_id;
	new models.test(model)
		.save((err,doc) => {
			if(err) {
				res.status(400)
					.send({
						error: err
					});
				return;
			}
			//Add test id to course
			addTestToCourse(doc._id,course)
				.then((courseDoc) => {
					doc.course = course;
					doc.save((err,doc) => {
						if(err) {
							res.status(400)
								.send({
									error: err
								});
							return;
						}
						res.status(200)
							.send({
								test: doc
							});
					})
				});
		});
};

tests.getTestsForClassroom = (req,res) => {
	const id = req.params.classroom_id;
	//Get classroom, to get students and tests.

	models.course.findOne({_id: id},'tests students',(err,doc) => {
		if (err !== null) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		//Creates array of objects that are test ID's and titles
		const courseTests = doc.tests.map(test => ({ id: test._id.toString(), title: test.title }));
		//This will be an array of students in this class and the
		//tests results of the tests from that class.
		const courseStudents = doc.students.map((student) => {
			//From that filter the students test id's to only be the ones in the class
			let studentTestIds = Object.keys(student.test_results);
			student.test_results = studentTestIds
				.filter(test => courseTests.findIndex(t => t.id === test)) //
				.map(testId => ({
					id: testId,
					name: ((id) => {
						const testName = courseTests.find((test) => test.id === id)
						return testName ? testName.title : ''
					})(testId),
					results: student.test_results[testId].answers,
					correct: student.test_results[testId].answers.reduce((acc,ans) => {
							if(ans.correct === true) {
								acc += 1;
							}
							return acc;
						},0)
				}));
			return student;
		});

		res
			.status(200)
			.send({
				results: courseStudents
			});
	})
	.populate('students','test_results firstName lastName')
	.populate('tests', 'title');
}

tests.getTests = (req,res) => {
	models.test.find({},(err,docs) => {
		if(err){
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				tests: docs
			});
	});
};

tests.getSingleTest = (req,res) => {
	const id = req.params.id;
	models.test.findOne({_id: id},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				test: doc
			});
	}).populate('questions');
};

tests.addQuestion = (req,res) => {
	const testId = req.params.id;
	const questionId = req.body.questionId;
	models.test.findOneAndUpdate({_id:testId},{
		$push: {questions: questionId}
	},{
		new: true
	},
	(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		addTestToQuestion(testId,questionId)
			.then(() => {
				models.test.populate(doc,{path: 'questions'},
					(err, testWithQuestions) => {
						if(err) {
							res.status(400)
								.send({
									error: err
								});
							return;
						}
						res.status(200)
							.send({
								test: testWithQuestions
							});
					});
			})
			.catch((err) =>{
				res.status(400)
					.send({
						error: err
					});
			});
	})
};

tests.updateTest = (req,res) => {
	const id = req.params.id;
	const model = req.body;
	models.test.findOne({_id:id}, (err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		if(model._id) {
			delete model._id;
		}
		Object.assign(doc,model);
		doc.save((err,saveDoc) => {
			if(err) {
				res.status(400)
					.send({
						error: err
					});
				return
			}
			res.status(200)
				.send({
					test: doc
				});
		});
	});
};

tests.addUser = (req,res) => {
	const testId = req.params.id;
	const userId = req.body.userId;
	models.test.findOneAndUpdate({_id: testId},{
		$addToSet: {users:userId}
	}, {
		new: true
	},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		addTestToUser(testId,userId)
			.then((user) => {
				res.status(200)
					.send({
						test: doc
					});
			})
			.catch((err) => {
				res.status(400)
					.send({
						error: err
					});
			});
	});
};

tests.evaluate = (req,res) => {
	const testId = req.params.id;
	const userId = req.body.userId;
	const answer = req.body.answer;
	//Check if user is part of test
	models.test.findOne({_id:testId},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		models.question.findOne({_id:answer.questionId},(err,doc) => {
			let userAnswer;
			if(doc.type === 'multiple choice') {
				userAnswer = new Promise((resolve,reject) => {
					resolve({
						id: doc._id,
						type: 'multiple choice',
						expected: doc.multiAnswer,
						actual: answer.answer,
						correct: (() => {
							return doc.multiAnswer === answer.answer
						})()
					})
				});
			}
			else {
				userAnswer = new Promise((resolve,reject) => {
					testRunner
						.run(doc,answer.answer)
						.then(res => resolve({
							id: doc._id,
							type: 'Code',
							actual: answer.answer,
							correct: JSON.parse(res)
						}))
						.catch(reject);
				});
			}
			userAnswer
				.then(answer => {
					models.user.findOne({_id: userId},{password: 0},(err,userDoc) => {
						if(err) {
							res.status(400)
								.send({
									error: err
								});
							return;
						}
						
						if(!userDoc.test_results) {
							userDoc.test_results = {};
						}
						
						if(userDoc.test_results[testId] === undefined) {
							userDoc.test_results[testId] = {
								answers: []
							};
						}
						userDoc.test_results[testId].answers.push(answer);
						//Need to add this for Mixed Types to be persisted 
						userDoc.markModified('test_results');
						userDoc.save((err,newUserDoc) => {
							if(err) {
								res.status(400)
									.send({
										error: err
									});
								return;
							}
							res.status(200)
								.send({
									user: newUserDoc,
									result: answer
								});
						});
					});
				})
				.catch((err) => {
					res.status(400)
						.send({
							error: (() => {
								return err || 'Something bad happened...although I don\'t know what.' 
							})()
						});
				});
		});
	}).populate('questions');
};

tests.removeQuestionFromTest = (req,res) => {
	const testId = req.params.id;
	const questionId = req.body.questionId;
	models.test.findOneAndUpdate({_id: testId}, {
		$pull: {questions: questionId}
	}, 
	{
		new: true
	},
	(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		removeTestFromQuestion(testId,questionId)
			.then(() => {
				models.test.populate(doc,{path: 'questions'},
					(err, testWithQuestions) => {
						if(err) {
							res.status(400)
								.send({
									error: err
								});
							return
						}
						res.status(200)
							.send({
								test: testWithQuestions
							});
					});
			})
			.catch((err) =>{
				res.status(400)
					.send({
						error: err
					});
			});
	});
};

tests.removeTest = (req,res) => {
	const id = req.params.id;
	models.test.findOneAndRemove({_id: id},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		const questionsToCleanUp = doc.questions.map((question) => removeTestFromQuestion(id,question))
		Promise.all([removeTestFromCourse(id,doc.course),...questionsToCleanUp])
			.then(() => {
				res.status(200)
					.send({
						success: true
					});
			})
			.catch((err) => {
				res.status(400)
					.send({
						error: err
					});
			});
	});
};

function addTestToCourse(testId,courseId) {
	return new Promise((resolve,reject) => {
		models.course.findOneAndUpdate({_id:courseId}, {
			$push: {tests: testId}
		},(err,doc) => {
			if(err) {
				reject(err)
			}
			resolve(doc);
		});
	});
}

function removeTestFromCourse(testId,courseId) {
	return new Promise((resolve,reject) => {
		models.course.findOneAndUpdate({_id: courseId},{
			$pull: {tests: testId}
		},
		{
			new: true
		}, (err,doc) => {
			if(err) {
				reject(err);
			}
			resolve(doc);
		});
	});
}

function addTestToUser(testId,userId) {
	return new Promise((resolve,reject) => {
		models.user.findOneAndUpdate({
			_id: userId
		},{
			$addToSet: {tests: testId}
		},{
			new: true
		}, (err,doc) => {
			if(err) {
				reject(err);
			}
			resolve(doc);
		});
	});
}

function addTestToQuestion(testId,questionId) {
	return new Promise((resolve,reject) => {
		//Add testid to question
		models.question.findOneAndUpdate({_id: questionId}, {
			$addToSet: {tests: testId}
		},(err,doc) =>{
			if(err) {
				reject(err);
			}
			resolve(doc);
		});
	});
}

function removeTestFromQuestion(testId,questionId) {
	return new Promise((resolve,reject) => {
		//Remove testId from question
		models.question.findOneAndUpdate({_id: questionId}, {
			$pull: {tests: testId}
		}, (err,doc) => {
			if(err) {
				reject(err);
			}
			resolve(doc);
		});
	});
}


function doesTestExist(testId,userResults) {
	if(userResults === undefined) {
		return false;
	}
	for(let result of userResults) {
		if(result.id === testId) {
			return true;
		}
	}
	return false;
}


module.exports = tests;