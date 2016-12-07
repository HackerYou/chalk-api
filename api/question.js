'use strict'

const question = {};
const models = require('../api/models/index.js');
const fs = require('fs');

question.createQuestion = (req,res) => {
	const model = req.body;
	new models.question(model).save((err,doc) => {
		if(err) {
			res.status(400).send({
				error: err
			});
			return;
		}
		if(doc.type === "Code") {

			fs.writeFile(`testCenter/test_${doc._id.toString()}.js`, doc.unitTest, (err) => {
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
		}
		else {
			res.status(200).send({
				question: doc
			});
		}
	})
};

question.getQuestions = (req,res) => {
	models.question.find({},(err,docs) => {
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
		removeTestFile(id)
			.then(_ => res.status(200).send({
				success: true
			}))
			.catch(console.log);

	});
}

function removeTestFile(id) {
	return new Promise((resolve,reject) => {
		const fileName = `testCenter/test_${id}.js`;
		const checkFile = fs.statSync(fileName);
		if(checkFile.isFile()) {
			fs.unlink(fileName, (err) => {
				if(err) {
					reject(err)
					return;
				}
				resolve();
			});
		}
		else {
			resolve();
		}
	});
}

module.exports = question;