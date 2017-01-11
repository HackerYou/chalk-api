#Chalk Notes API [![Build Status](https://travis-ci.org/HackerYou/chalk-api.svg)](https://travis-ci.org/HackerYou/starbuck-api)

API for Chalk Notes app.

For information about the available endpoints check out the [wiki](https://github.com/HackerYou/chalk-api/wiki).

###Deployment

In order for the tests to run you will need to install `jest` globally, make sure to run `npm install -g jest`. We also need `babel` so make sure to run `npm install -g babel-cli`.

###Development

When running this in development use `nodemon`.

###Tests
To run tests, make sure you have a `mongod` instance running and the `server.js` file. Start up script to come!


###TODO
In `v2` make API follow [`json:api`](http://jsonapi.org/) spec, to make it more adaptable to future clients. It will create a standardized interface.

