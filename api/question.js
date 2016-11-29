'use strict'

const question = {};
const models = require('../api/models/index.js');


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
	})
};

question.removeQuestion = (req,res) => {
	const id = req.params.id;
	models.question.findOneAndRemove({_id: req.id }, (err,doc) => {
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
}

module.exports = question;