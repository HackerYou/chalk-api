'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign(mixin,{
	exercises: [{type: Schema.ObjectId, ref: 'Exercise'}]
});

let topicSchema = new Schema(model);

module.exports = mongoose.model('Topic', topicSchema);