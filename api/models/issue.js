'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mixin = require('./modelMixin.js');

let model = Object.assign({
	body: String,
	archived: {type: Boolean, default: false},
	archived_by: { type: String, ref: "User" },
	topic_id: String
},
mixin, 
{
	created_at: {
		type: Number,
		default: Date.now
	}
});

let issueSchema = new Schema(model);

module.exports = mongoose.model('Issue',issueSchema);

