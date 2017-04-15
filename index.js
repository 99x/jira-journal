'use strict';

require('dotenv-extended').load();

const restify = require('restify');
const bot = require('./bot.js');

const server = restify.createServer();
server.post('/bot', bot.connector('*').listen());
server.listen(process.env.PORT, () => {
    console.log('${server.name} listening to ${server.url}');
});