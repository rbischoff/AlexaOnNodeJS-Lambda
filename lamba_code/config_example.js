//change this file to config.js and add it to your .gitignore if using a public repo
var config = {
    appid: "Alexa Skills Skills id. amzn1.echo-sdk-ams.app.ffffffffffff-fffffffff-fffffffff",
    host : "external IP of the node server",
    port : "port of the external IP you natted on the firewall",
    aes_algorithm: "choose one, probably aes-256-gcm",
    aes_secure_key: "hex openssl key you placed in home server config file",
    username: "same as home server",
    password: "same as home server",
    https_pin: "pin used for self signed cert"
};

module.exports = config;