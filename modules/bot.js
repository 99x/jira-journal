'use strict';

const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);

bot.set('persistConversationData', true);

bot.on('contactRelationUpdate', (message) => {

    if (message.action === 'add') {

        const card = new builder.HeroCard()
            .title('JIRA Journal Bot')
            .text('Your bullet journal - whatever you want to log.')
            .images([
                new builder.CardImage().url('http://docs.botframework.com/images/demo_bot_image.png')
            ]);
        const reply = new builder.Message()
            .address(message.address)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments([card]);
        bot.send(reply);

        bot.send('Hi... I\'m the JIRA Journal Bot for time reporting. Thanks for adding me. Say \'help\' to see what I can do');

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

bot.dialog('/', require('./journal'));

bot.dialog('/help', require('./help'))
    .triggerAction({
        matches: [/^help|yelp|how to?/i]
    });

bot.dialog('/signin', require('./signin'))
    .triggerAction({
        matches: [/^sign in|let me in/i]
    });

bot.dialog('/reset', require('./reset'))
    .triggerAction({
        matches: [/^reset/]
    });

module.exports = exports = bot;