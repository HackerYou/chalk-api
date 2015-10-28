'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign(mixin,{
	topics: [{type: Schema.ObjectId, ref: 'Topic'}]
});

module.exports = mongoose.model('Exercise', model);