'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = new mongoose.Schema;

let exerciseSchema = Schema(
	Object.assign(mixin,{
		tile: String,
		content: String
	})
);

module.exports = mongoose.model('Exercise', exerciseSchema);