'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	path: String,
	name: String,	
	created_at: Number,
	created_by: String
});

let mediaSchema = new Schema(model);

module.exports = mongoose.model('Media',mediaSchema);