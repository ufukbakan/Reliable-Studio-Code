const cryptoJs = require('crypto-js');

function encode(pureText, passphrase) {
    let prefixed = "ValidatorPrefix".concat(pureText);
    return cryptoJs.AES.encrypt(prefixed, passphrase).toString();
}
function decode(encodedCode, secretKey) {
    if(!secretKey)
        throw new Error('You are missing the secret key');
    let decoded = cryptoJs.AES.decrypt(encodedCode, secretKey).toString(cryptoJs.enc.Utf8);
    if(startsWithValidatorPrefix(decoded))
        return decoded.substring(15);
    else
        throw new Error('Secret key was incorrect, or encoded input was malformed.');
}

function startsWithValidatorPrefix(text){
    return text.substring(0, 15) === 'ValidatorPrefix';
}

module.exports = {encode, decode};