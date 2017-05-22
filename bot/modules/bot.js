'use strict';

const builder = require('botbuilder');

const logger = require('./logger');
const notfound = require('./404');
const unauthorized = require('./401');
const journal = require('./journal');
const help = require('./help');
const signin = require('./signin');
const reset = require('./reset');

const chatsettings = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

const connector = new builder.ChatConnector(chatsettings);

const bot = new builder.UniversalBot(connector);

bot.set('persistConversationData', true);

bot.use(logger);

bot.on('error', (data) => {
    console.log('Oops! Something went wrong. Shame on us! (facepalm)', arguments);
});

bot.on('contactRelationUpdate', (message) => {

    if (message.action === 'add') {

        const card = new builder.HeroCard()
            .title('JIRA Journal Bot')
            .subtitle('Your bullet journal - whatever you want to log.')
            .text(`Hay ${message.user.name}... I'm the JIRA Journal Bot for time reporting. Thanks for adding me. Say 'help' to see what I can do`)
            .images([
                new builder.CardImage().url('https://github.com/99xt/jira-journal/blob/master/icon.png')
            ]);
        const reply = new builder.Message()
            .address(message.address)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments([card]);
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('typing', (message) => {
    // User is typing
});

bot.on('deleteUserData', (message) => {
    // User asked to delete their data
});

bot.dialog('/', journal);

bot.dialog('/404', notfound);
bot.dialog('/401', unauthorized);

bot.dialog('/history', journal)
    .triggerAction({
        matches: [/^recent|history$/]
    });

bot.dialog('/assigned', journal)
    .triggerAction({
        matches: [/^assigned|my tasks|my jira tasks|assigned to me$/]
    });

bot.dialog('/help', help)
    .triggerAction({
        matches: [/^help|yelp|how to?$/]
    });

bot.dialog('/signin', signin)
    .triggerAction({
        matches: [/^sign in|login|let me in$/]
    });

bot.dialog('/reset', reset)
    .triggerAction({
        matches: [/^reset|reset me|logout|sign out$/]
    });

module.exports = exports = bot;