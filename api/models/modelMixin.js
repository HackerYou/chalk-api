'use strict';

let mongoose = require('mongoose');

module.exports = {
	title: String,
	created_at: Number,
	created_by: mongoose.Schema.ObjectId,
	updated_at: Number,
	updated_by: mongoose.Schema.ObjectId
};