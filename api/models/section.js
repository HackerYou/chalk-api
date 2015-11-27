'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	lessons: [{type: String, ref: 'Lesson'}],
}, mixin);

let sectionSchema = new Schema(model);

module.exports = mongoose.model('Section', sectionSchema);