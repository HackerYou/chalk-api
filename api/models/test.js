'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	title: 'string',
	questions: [{ref:'Question', type: 'ObjectId'}],
	hidden: { type: 'String', default: 'false'},
	course: {ref: "Course", type: 'ObjectId'},
	users: [{type: 'String', ref: 'User'}]
}, mixin);

let testSchema = new Schema(model);

module.exports = mongoose.model('Test', testSchema);