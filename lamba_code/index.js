const AlexaSkill = require('./js/AlexaSkill');
const express = require('express');
const request = require('request');
const https = require('https');
const xor = require('bitwise-xor');
const fs = require('fs');

const serverinfo = require('./js/serverinfo');
const config = require('./config');
const secure = require('./js/secure');

var APP_ID = config.appid;


var Tivo = function () {
    AlexaSkill.call(this, APP_ID);
};


// Extend AlexaSkill
Tivo.prototype = Object.create(AlexaSkill.prototype);
Tivo.prototype.constructor = Tivo;

Tivo.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Tivo onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Tivo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Tivo onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the TV Controls, I can control the TV for you.";
    var repromptText = "You can say change channel to with the name of the channel.";
    response.ask(speechOutput, repromptText);
};

Tivo.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Tivo onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Tivo.prototype.intentHandlers = {
    // register custom intent handlers

    HelpIntent: function (intent, session, response) {
        response.ask("You can tell the TV to turn off and on, and request for various channels.");
    },

    newEpisodeIntent: function (intent, session, response) {
        var name = intent.slots.titlename.value; //pulls variable from intent
        var header = {'showname' : name};

        sendCommand("/plex/playlatestepisode",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        });           
    },

    searchMovieIntent: function (intent, session, response) {
        var name = intent.slots.titlename.value; //pulls variable from intent
        var header = {'moviename' : name};
        console.log("received request to play " + name);

        sendCommand("/plex/searchmovie",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        });           
    },

    recentlyAddedIntent: function (intent, session, response) {
        var mediatype = intent.slots.mediatype.value; //pulls variable from intent
        
        if (mediatype == "shows") {
            mediatype="episodes";
        }
        var header = {'mediatype' : mediatype};
        console.log("received request to play " + mediatype);

        sendCommand("/plex/recentlyadded",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        });           
    },

    TVPowerIntent: function (intent, session, response) {
    		var powerintent = intent.slots.power.value;
        var header = {'power': intent.slots.power.value};//pulls variable from intent

        sendCommand("/sonybravia/power",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell("TV Power " + powerintent + "sent.");
        });           
    },

    TVPowerStatusIntent: function (intent, session, response) {

        sendCommand("/sonybravia/power", {'power': 'status'}, null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        });           
    },

    VideoInputIntent: function (intent, session, response) {
        inputnumber = intent.slots.inputnumber.value;  //grab input value from user request
        var header = {'inputnumber': inputnumber};

        sendCommand("/sonybravia/videoinput",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        });      
    },

    EverythingPowerIntent: function (intent, session, response) {
        //sets the users power intent variable
        var powerintent = intent.slots.power.value;
        var header = {'powerintent': powerintent};
        var speechOutput = "";

        console.log("User has requested that the TV turn " + powerintent);

        sendCommand("/sonybravia/power",header,null,function ResponseCallback(res) {
            console.log(res);
            speechOutput += res + ", ";

            //determine if TV has actually been switched off/on
            if(res == "I have switched the TV "+powerintent) {
                sendCommand("/tivo/power",header,null,function ResponseCallback(res) {
                    console.log(res);
                    speechOutput += res;

                    response.tell(speechOutput);
                });  
            } else {
                response.tell(speechOutput);
            }
        });   
       
    },

    ChannelIntent: function (intent, session, response) {
        //Match name of channel to the corresponding number in channel-list.
        var channelname = intent.slots.channel.value.toLowerCase();   
        var header = {'channelname': channelname};

        sendCommand("/tivo/changechannel",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        }); 
    },

    ClosedCapIntent: function (intent, session, response) {
        //Match name of channel to the corresponding number in channel-list.
        var statusintent = intent.slots.cc.value.toLowerCase();   
        console.log("Closed caption has been requested " + statusintent + " by user.");
        var header = {'cc': statusintent};

        sendCommand("/tivo/cc",header,null,function ResponseCallback(res) {
            console.log(res);
            response.tell(res);
        }); 
    }

};

function sendCommand(path,header,body,callback) {

    // username & password hash is encrypted each time the function is called
    var xored = xor(config.password, config.username);
	var encrypted = secure.encrypt(xored);
	header.phrase = encrypted.content;
	header.iv = encrypted.iv;

    var ca = fs.readFileSync('ca/cert.pem', 'utf8');
    var opt = {
        host: serverinfo.host,
        port:serverinfo.port,
        path: path,
        method: 'POST',
        ca: [ca],
        headers: header,
        checkServerIdentity: function (host, cert) {
            return undefined;
        }
    };

    console.log('before request');
    var req = https.request(opt, function(res) {
        res.setEncoding('utf8');
        console.log('in request');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
            callback(chunk);
        });
    });

    if (body) req.write(body);
    req.end();
}

exports.handler = function (event, context) {
    // Create an instance of the Tivo skill.
    var tivo = new Tivo();
    tivo.execute(event, context);
};

