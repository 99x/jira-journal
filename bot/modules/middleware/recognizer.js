'use strict';

const builder = require('botbuilder');
const map = process.env.LUIS_MODEL_URL;

const luis = new builder.LuisRecognizer(map);

module.exports = exports = {
    luis
};