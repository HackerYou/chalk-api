'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign({
	topics: [{type: Schema.Types.ObjectId, ref: 'Topic'}],
	revisions: [Schema.Types.Mixed],
	body: String,
	// media: [{type: String, ref: 'Media'}]
},mixin);

let exerciseSchema = new Schema(model);

module.exports = mongoose.model('Exercise', exerciseSchema );