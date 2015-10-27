'use strict';

let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/notes');

module.exports = {
	topic: require('./topic.js')
};