'use strict';

const builder = require('botbuilder');

const logger = require('./logger');
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

bot.on('contactRelationUpdate', (message) => {

    if (message.action === 'add') {

        const card = new builder.HeroCard()
            .title('JIRA Journal Bot')
            .text('Your bullet journal - whatever you want to log.')
            .images([
                new builder.CardImage().url('https://github.com/99xt/jira-journal/blob/master/icon.png')
            ]);
        const reply = new builder.Message()
            .address(message.address)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments([card]);
        bot.send(reply);

        bot.send(`Hi... I'm the JIRA Journal Bot for time reporting. Thanks for adding me. Say 'help' to see what I can do`);

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

bot.dialog('/history', journal)
    .triggerAction({
        matches: [/^recent|history/i]
    });

bot.dialog('/assigned', journal)
    .triggerAction({
        matches: [/^assigned|my tasks|my jira tasks|assigned to me/i]
    });

bot.dialog('/help', help)
    .triggerAction({
        matches: [/^help|yelp|how to?/i]
    });

bot.dialog('/signin', signin)
    .triggerAction({
        matches: [/^sign in|let me in/i]
    });

bot.dialog('/reset', reset)
    .triggerAction({
        matches: [/^reset/]
    });

module.exports = exports = bot;