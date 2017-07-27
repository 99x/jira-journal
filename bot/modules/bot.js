'use strict';

const builder = require('botbuilder');

const logger = require('./middleware/logger');
const recognizer = require('./middleware/recognizer');

const fetch = require('./dialogs/fetch');
const assigned = require('./dialogs/assigned');
const recent = require('./dialogs/recent');
const worklog = require('./dialogs/worklog');
const greet = require('./dialogs/greet');
const help = require('./dialogs/help');
const signin = require('./dialogs/signin');
const reset = require('./dialogs/reset');

const chatsettings = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

const connector = new builder.ChatConnector(chatsettings);

const bot = new builder.UniversalBot(connector, (session) => {
    session.endDialog();
});

bot.set('localizerSettings', {
    defaultLocale: 'en'
});

bot.set('persistConversationData', true);

bot.recognizer(recognizer.luis);

bot.library(fetch.createNew());
bot.library(assigned.createNew());
bot.library(recent.createNew());
bot.library(worklog.createNew());
bot.library(greet.createNew());
bot.library(help.createNew());
bot.library(signin.createNew());
bot.library(reset.createNew());

bot.use(...[logger]);

bot.on('error', (data) => {
    console.log('Oops! Something went wrong. Shame on us! (facepalm)');
});

bot.on('contactRelationUpdate', (message) => {
    if (message.action === 'add') {
        // Handle by greet:/firstrun
    } else {
        // Delete their data
    }
});

bot.on('typing', (message) => {
    // User is typing
});

bot.on('deleteUserData', (message) => {
    // User asked to delete their data
});

module.exports = exports = bot;