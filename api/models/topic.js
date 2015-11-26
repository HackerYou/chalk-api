'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign({
	exercises: [{type: String, ref: 'Exercise'}],
	lessons: [{type: String, res: 'Lesson'}],
	revisions: [Schema.Types.Mixed],
	body: String,
	description: String,
	category: String
},mixin);

let topicSchema = new Schema(model);

module.exports = mongoose.model('Topic', topicSchema);