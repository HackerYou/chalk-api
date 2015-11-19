'use strict';

let mongoose = require('mongoose');
let mixin = require('./modelMixin.js');

let Schema = mongoose.Schema;

let model = Object.assign({
	body: String,
	audience: String
},mixin);

let announcementSchema = new Schema(model);

module.exports = mongoose.model('Announcement', announcementSchema );