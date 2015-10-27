'use strict';

let topic = {};
let models = require('./models/index.js');

topic.createTopic = (req,res) => {
	let model = req.body;
	model.createdAt = +new Date();
	new models.topic(model).save((err) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: model
			});
		}
	});
};

topic.getTopics = (req,res) => {
	models.topic.find({},{'__v': 0}, (err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				topic: docs
			});
		}
	});
};

module.exports = topic;






