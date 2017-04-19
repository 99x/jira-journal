'use strict';

const builder = require('botbuilder');

module.exports = exports = [(session) => {

    const card = new builder.HeroCard(session)
        .title('JIRA Journal Bot')
        .text('Your bullet journal - whatever you want to log.')
        .images([
            builder.CardImage.create(session, 'http://docs.botframework.com/images/demo_bot_image.png')
        ]);

    const reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.list)
        .attachments([card]);
    session.send(reply);
    session.endDialog('Hi... I\'m the JIRA Journal Bot for time reporting. Thanks for adding me. Say \'help\' to see what I can do');
}];