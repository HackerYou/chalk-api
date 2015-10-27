'use strict';

let express = require('express');
let app = express();

app.get('/', (req,res) => {
	res.send('Hi');
});


app.listen('3200');
console.log('App listening on port 3200');