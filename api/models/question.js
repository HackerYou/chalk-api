'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	type: 'string',
	category: 'string',
	difficulty: 'string',
	body: 'string',
	multiAnswer: 'string',
	multiChoice: [{
		label: 'string',
		value: 'string'
	}],
	unitTest: 'string'
}, mixin);

let questionnSchema = new Schema(model);

module.exports = mongoose.model('Question', questionnSchema);