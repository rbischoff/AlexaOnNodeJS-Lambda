const plex = require('./js/plex');
const sonybravia = require('./js/routes/sonybravia');
const tivo = require('./js/tivo');
const constants = require('constants');
const couchpotato = require('./js/couchpotato');
const secure = require('./js/secure.js');
const config = require('./js/config.js');

//node modules
const xor = require('bitwise-xor');
const express = require('express');
const https = require('https');
const app = express();

//This function checks to see if the decrypted hash matches the one stored
//locally and refuses access to the server if it doesn't match
function isUser(req, res, next) {
	var header = req.headers;
	var encrypted = {
		content: header.phrase,
		iv: header.iv
	};

	if(secure.decrypt(encrypted) == xor(config.username, config.password)){
		console.log("Success");
		next();
	}else {
		console.log("Failed Attempt");
		res.send('Thanks Obama!');
	}
}

// app.all checks all incoming requests with isUser
app.all('*', isUser);
app.use('/plex', plex);
app.use('/sonybravia', sonybravia);
app.use('/tivo', tivo);
app.use('/cp', couchpotato);


// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('API Homepage works');
});

var credentials = {
    key: config.secure.https_private_key,
    cert: config.secure.https_cert,
    passphrase: config.secure.https_pin
};

// Uncomment this to see if acutal keys are passing
//console.log(credentials);

//setup secure server and wait for the get request
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port);
console.log('Local server running on port %s', config.port);

