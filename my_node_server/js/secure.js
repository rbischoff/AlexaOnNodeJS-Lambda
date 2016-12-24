const crypto = require('crypto');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('hex');
const config = require('./config');

// message encryption
function encrypt(text) {
  var iv = crypto.randomBytes(16);
  var cipher = crypto.createCipheriv(config.aes_algorithm, config.aes_secure_key, iv);
  var encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: decoder.end(tag),
    iv: decoder.end(iv)
  };
}

// message decryption
function decrypt(encrypted) {
  var iv = Buffer(encrypted.iv, 'hex');
  var tag = Buffer(encrypted.tag, 'hex');
  var decipher = crypto.createDecipheriv(config.aes_algorithm, config.aes_secure_key, iv);
  decipher.setAuthTag(tag);
  var dec = decipher.update(encrypted.content, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;