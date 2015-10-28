'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign({
	topics: [{type: Schema.ObjectId, ref: 'Topic'}]
},mixin);

let exerciseSchema = new Schema(model);

module.exports = mongoose.model('Exercise', exerciseSchema );