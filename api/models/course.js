'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	sections: [{ type: String, ref: 'Section' }],
	template: Boolean,
	term: String,
	instructor: String,
	description: String,
	students: [{type: String, ref: 'User'}]
}, mixin);

let courseSchema = new Schema(model);

module.exports = mongoose.model('Course', courseSchema);