'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	lessons: [{type: Schema.ObjectId, ref: 'Lesson'}]
}, mixin);

let courseSchema = new Schema(model);

module.exports = mongoose.model('Course', courseSchema);