'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	topics: [{type: Schema.ObjectId, ref: 'Topic'}],
	revisions: [Schema.Types.Mixed],
	body: String,
	description: String
},mixin);

let lessonSchema = new Schema(model);

module.exports = mongoose.model('Lesson',lessonSchema);