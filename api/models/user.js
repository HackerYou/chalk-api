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
	courses: [{type: String, ref: 'Course'}],
	updated_at: Number,
	created_at: Number,
	first_sign_up: Boolean,
	favorites: Schema.Types.Mixed
};

let userSchema = new Schema(model);

module.exports = mongoose.model('User', userSchema);