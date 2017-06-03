'use strict';

const builder = require('botbuilder');

const logger = require('./middleware/logger');
const worklog = require('./dialogs/worklog');
const help = require('./dialogs/help');
const signin = require('./dialogs/signin');
const reset = require('./dialogs/reset');

const chatsettings = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

const connector = new builder.ChatConnector(chatsettings);

const bot = new builder.UniversalBot(connector, null, 'worklog:/');

bot.set('persistConversationData', true);

bot.use(...[logger]);

bot.on('error', (data) => {
    console.log('Oops! Something went wrong. Shame on us! (facepalm)');
});

bot.on('contactRelationUpdate', (message) => {

    if (message.action === 'add') {

        const welcomeCard = new builder.HeroCard()
            .title('JIRA Journal Bot')
            .subtitle('Your bullet journal - whatever you want to log.')
            .text(`Hay ${message.user.name}... thanks for adding me. Say 'help' to see what I can do`)
            .images([
                new builder.CardImage().url('https://github.com/99xt/jira-journal/wiki/icon.png').alt('jira-jouranl-bot-logo')
            ]);

        bot.send(new builder.Message().address(message.address).addAttachment(welcomeCard));
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

bot.library(worklog.createNew());

// bot.dialog('/history', journal)
//     .triggerAction({
//         matches: [/^(history|recent|recently used)$/g]
//     });

// bot.dialog('/assigned', journal)
//     .triggerAction({
//         matches: [/^(assigned|my tasks|my jira tasks|assigned to me)$/g]
//     });

bot.library(help.createNew());
bot.library(signin.createNew());
bot.library(reset.createNew());

// bot.dialog('/', (session, args) => {
//     session.replaceDialog('/worklog', args);
// });

module.exports = exports = bot;