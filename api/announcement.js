'use strict';

let announcement = {};
let models = require('./models/index.js');

announcement.createAnnouncement = (req,res) => {
	let model = req.body;
	model.created_at = +new Date();
	new models.announcement(model).save((err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				announcement: doc
			});
		}
	});
};

announcement.getAnnouncements = (req,res) => {
	let audience = req.params.audience || '';
	let query = (() => {
		return audience !== '' ? {audience:audience} : {}
	})();
	models.announcement.find(
		query,
		{__v:0},
		(err,docs) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				announcement: docs
			});
		}
	});
};

announcement.getAnnouncement = (req,res) => {
	let id = req.params.id;
	models.announcement.findOne(
		{_id: id},
		{__v: 0},
		(err,doc) => {
		if(err) {
			res.send({
				error: err
			});
		}
		else {
			res.send({
				announcement: doc
			});
		}
	});
};

announcement.updateAnnouncement = (req,res) => {
	let id = req.params.id;
	let model = req.body;
	model.updated_at = +new Date();
	models.announcement.findOneAndUpdate(
		{_id: id},
		model,
		{new:true}, 
		(err,doc) => {
			if(err) {
				res.send({
					error: err
				});
			}
			else {
				res.send({
					announcement: doc
				});
			}
		});
};

announcement.removeAnnouncement = (req,res) => {
	let id = req.params.id;

	models.announcement.findOne({_id:id}, (err,doc) => {
		if(err){
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
						announcement: []
					});
				}
			});
		}
	});
};

module.exports = announcement;





