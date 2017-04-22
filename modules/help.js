'use strict';

const builder = require('botbuilder');

module.exports = exports = [(session) => {

    const card = new builder.HeroCard(session)
        .title('JIRA Journal Bot')
        .text('Your bullet journal - whatever you want to log.')
        .images([
            builder.CardImage.create(session, 'https://bot-framework.azureedge.net/bot-icons-v1/jira-journal_1kD9TrAk04dW4K92uPBis7Bk2wP1rT3VI6NMBk95Lo7TC3BU.png')
        ]);

    const reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.list)
        .attachments([card]);
    session.send(reply);
    session.endConversation('Hi... I\'m the JIRA Journal Bot for time reporting. Thanks for adding me. Say \'help\' to see what I can do!');
}];