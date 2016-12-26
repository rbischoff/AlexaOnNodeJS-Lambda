const crypto = require('crypto');
const xor = require('bitwise-xor');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('hex');
const config = require('./config');

// message encryption
function encrypt(text) {
  var iv = crypto.randomBytes(16);
  var cipher = crypto.createCipheriv(config.aes_algorithm, config.aes_secure_key, iv);
  var encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    content: encrypted,
    iv: decoder.end(iv)
  };
}

// message decryption
function decrypt(encrypted) {
  var iv = Buffer(encrypted.iv, 'hex');
  var decipher = crypto.createDecipheriv(config.aes_algorithm, config.aes_secure_key, iv);
  var dec = decipher.update(encrypted.content, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;