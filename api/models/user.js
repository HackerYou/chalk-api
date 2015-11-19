'use strict';

let modelMixin = require('./modelMixin.js');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let model = {
	admin: Boolean,
	instructor: Boolean,
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	courses: [{type: Schema.ObjectId, ref: 'Course'}],
	updated_at: Number,
	created_at: Number
};

let userSchema = new Schema(model);

module.exports = mongoose.model('User', userSchema);