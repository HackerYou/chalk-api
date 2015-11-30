'use strict';

let media = {};
let config = require('../config.js');
let fs = require('fs');
let models = require('./models/index.js');
let Busboy = require('busboy');
let AWS = require('aws-sdk');

AWS.config.accessKeyId = config.aws_access_key_id;
AWS.config.secretAccessKey = config.aws_secret_access_key;

let s3 = new AWS.S3({params: {Bucket: config.aws_bucket}});

media.getFiles = (req,res) => {
	models.media.find({},{__v:0},(err,docs) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		res.send({
			media: docs
		});
	});
};

media.uploadFile = (req,res) => {
	let busboy = new Busboy({headers: req.headers});

	busboy.on('file',(fieldname, file, filename, encoding, mimetype) => {
		let bufferArray = [];

		file.on('data',(data) => {
			bufferArray.push(data);
		});
		file.on('end', () => {
			let newFile = Buffer.concat(bufferArray);
			s3.createBucket(() =>{
				s3.upload({Body: newFile, Key: filename, ContentType: mimetype, ACL: 'public-read'}, 
					(err,data) => {
						if (err) {
							res.send({
								error: err
							});
							return;
						}
						new models.media({
							path: data.Location,
							name: filename,
							created_at: +new Date(),
						}).save((err,doc) => {
							if(err) {
								res.send({
									error: err
								});
								return;
							}
							res.send({
								media: doc
							});
						});
				});
			});
		});
	});
	return req.pipe(busboy);
};

media.removeFile = (req,res) => {
	let key = req.params.key;
	s3.deleteObject({
		Bucket: config.aws_bucket,
		Key: key
	}, (err,data) => {
		if(err) {
			res.send({
				error: err
			});
			return;
		}
		models.media.findOne({name:key}, (err,doc) => {
			if(err) {
				res.send({
					error: err
				});
			}
			doc.remove((err) => {
				if(err) {
					res.send({
						error: err
					})
				}
				res.send({
					media: []
				});			
			});
		});
	});
};


module.exports = media;