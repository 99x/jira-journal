'use strict';

const builder = require('botbuilder');

module.exports = exports = [
    (session) => {

        const card = new builder.HeroCard(session)
            .title('JIRA Journal Bot')
            .text('Your bullet journal - whatever you want to log.')
            .images([
                builder.CardImage.create(session, 'https://github.com/99xt/jira-journal/blob/master/icon.png')
            ]);

        const reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments([card]);
        session.send(reply);
        const name = session.message.user.name;
        session.endConversation(`Hey ${name}... I'm the JIRA Journal Bot for time reporting. Thanks for adding me. Say 'help' to see what I can do!`);
    }
];