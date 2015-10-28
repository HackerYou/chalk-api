'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign({
	exercises: [{type: Schema.ObjectId, ref: 'Exercise'}]
},mixin);

let topicSchema = new Schema(model);

module.exports = mongoose.model('Topic', topicSchema);