const models = require('./models');
const issues = {};

issues.createIssue = (req,res) => {
	const model = req.body;
	model.created_by = req.decodedUser.user_id;
	new models.issue(model).save((err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				issue: doc
			});
	});
};

issues.getIssues = (req, res) => {
	models.issue.find({},(err,docs) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;	
		}
		res.status(200)
			.send({
				issues: docs
			});
	}).populate('created_by','firstName lastName');	
};

issues.getIssueById = (req, res) => {
	const id = req.params.id;
	models.issue.find({_id: id}, (err, doc) => {
		if(err) {
			res.status(400) 
				.send({
					error: err
				});
			return;
		}
		res.status(200)
			.send({
				issue: doc
			});
	});
};

issues.updateIssueById = (req, res) => {
	const id = req.params.id;
	const model = req.body;

	delete model._id;

	models.issue.findOne({_id:id}, (err,doc) => {
		if(err) {
			res.status(400)
				.send({
					error: err
				});
			return;
		}
		model.updated_at = Date.now();
		model.updated_by = req.decodedUser.user_id;
		Object.assign(doc,model);
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
					issue: doc
				});
		})
	}).populate('created_by', 'firstName lastName');;
};

issues.removeIssueById = (req, res) => {
	const id = req.params.id;
	models.issue.findOneAndRemove({_id: id}, (err, doc) => {
		if(err) {
			res.status(400) 
				.send({
					error: err
				})
			return;
		}
		models.issue.find({},(err,docs) => {
			if(err) {
				res.status(400) 
					.send({
						error: err
					})
				return;
			}
			res.status(200)
				.send({
					issues: docs
				});
		}).populate('created_by', 'firstName lastName');	
	});
};


module.exports = issues;