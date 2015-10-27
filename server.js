'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let api = require('./api/index.js');

app.use(bodyParser.json());

app.get('/', (req,res) => {
	res.send('Hi');
});

//Topics
app.get('/v1/topic',api.topic.getTopics);
app.post('/v1/topic',api.topic.createTopic);


app.listen('3200');
console.log('App listening on port 3200');