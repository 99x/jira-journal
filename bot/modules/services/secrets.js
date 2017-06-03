'use strict';

const randomstring = require('randomstring');
const options = {
    length: 6,
    charset: 'hex'
};

const whisper = () => {
    return randomstring.generate(options);
};

module.exports = exports = {
    whisper
};