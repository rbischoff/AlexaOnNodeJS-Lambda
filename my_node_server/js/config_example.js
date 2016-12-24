// Rename this file to config.js after making nessecary changes 
// Please do not push config information to a public repo
const fs = require('fs');
var config = {
    host: "host ip here",
    port: "port",
    plexip: "plex server IP",
    plexusername: "plex username",
    plexport: "plexport",
    plexpassword: "plex password",
    plexservermachineid: "special machine id of plex server",
    plextvclientmachineid: "special machine id of the device you want to play to",

    sony : {
    	ip: "bravia TV IP. needs to be static",
    	port : '80',
        pin : 'set this on tv and put value here'
    },

    plexOptions: {
	    product: "Plex for iOS",
	    version: "4.0.6",
	    device: "iPhone",
	    deviceName: "iphone",
	    identifier: "Node JS"
	},

	cp: {
		ip : 'IP of couchpotato',
		port : '5050',
		rootpath : 'root path of couch potato'
	},

	sonarr: {
		ip : 'sonarr IP',
		port : 'sonarr port: Usually 8989',
		apikey : 'api key for sonarr'
	},

    secure: {
        aes_algorithm: "aes-256-gcm",
        aes_secure_key: "generate an openssl hex hey for here",
        https_private_key: fs.readFileSync('/Path/to/key.pem', 'utf8'),
        https_public_key: fs.readFileSync('/Path/to/cert.pem', 'utf8'),
        https_pin: "pin used when creating self signed cert",
        password: 'anypassword',
        username: 'anyusername'

    }

};

module.exports = config;
