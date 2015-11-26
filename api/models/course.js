'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	lessons: [{type: String, ref: 'Lesson'}],
	template: Boolean,
	term: String,
	instructor: String,
	description: String,
	students: []
}, mixin);

let courseSchema = new Schema(model);

module.exports = mongoose.model('Course', courseSchema);