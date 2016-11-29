'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	type: 'string',
	category: 'string',
	difficulity: 'string',
	body: 'string',
	answer: 'string',
	multiChoice: [{
		label: 'string',
		value: 'string'
	}]
}, mixin);

let questionnSchema = new Schema(model);

module.exports = mongoose.model('Question', questionnSchema);