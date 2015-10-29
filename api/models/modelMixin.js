'use strict';

let mongoose = require('mongoose');

module.exports = {
	title: String,
	content: String,
	createdAt: Number,
	createdBy: mongoose.Schema.ObjectId,
	updatedAt: Number
};