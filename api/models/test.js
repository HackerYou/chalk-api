'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	title: 'string',
	questions: [{ref:'Question', type: 'ObjectId'}],
	course: {ref: "Course", type: 'ObjectId'}
}, mixin);

let testSchema = new Schema(model);

module.exports = mongoose.model('Test', testSchema);