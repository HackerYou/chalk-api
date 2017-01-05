'use strict'

const question = {};
const models = require('../api/models/index.js');
const testRunner = require('./testRunner.js');

question.createQuestion = (req,res) => {
	const model = req.body;
	new models.question(model).save((err,doc) => {
		if(err) {
			res.status(400).send({
				error: err
			});
			return;
		}
		res.status(200).send({
			question: doc
		});
	});
};

question.getQuestions = (req,res) => {
	const query = req.query;
	models.question.find(query,(err,docs) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				questions: docs
			})
	});
};

question.getSingleQuestion = (req,res) => {
	const id = req.params.id;
	models.question.findOne({_id:id},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				question: doc
			});
	});
};

question.updateQuestion = (req,res) => {
	const id = req.params.id;
	const newModel = req.body;
	models.question.findOne({_id:id},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: res
				});
			return;
		}
		delete newModel._id;

		Object.assign(doc,newModel);

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
					question: doc
				});
		});
	});
};

question.removeQuestion = (req,res) => {
	const id = req.params.id;
	models.question.findOneAndRemove({_id: id }, (err,doc) => {
		if(err) {
			res.status(400).send({
				error: err
			});
			return;
		}
		res.status(200).send({
			success: true
		});
	});
};

question.dryRun = (req,res) => {
	const userAnswer = req.body.answer;
	const questionId = req.params.id;
	models.question.findOne({_id:questionId},(err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		testRunner.run(doc,userAnswer)
			.then((data) => {
				res.status(200)
					.send({
						results: JSON.parse(data)
					});
			})
			.catch((err) => {
				res.status(400)
					.send({
						error: err
					})
			});
	});
}

module.exports = question;