'use strict';

const builder = require('botbuilder');

module.exports = exports = [
    (session, results, next) => {
        const {
            message,
            exception
        } = results;

        // const card = new builder.HeroCard(session)
        //     .title('JIRA Journal Bot')
        //     .text('Your bullet journal - whatever you want to log.')
        //     .images([
        //         builder.CardImage.create(session, 'https://github.com/99xt/jira-journal/blob/master/icon.png')
        //     ]);

        // const reply = new builder.Message(session)
        //     .attachmentLayout(builder.AttachmentLayout.list)
        //     .attachments([card]);
        // session.send(reply);
        console.log('Exception Occured:', JSON.stringify(exception));

        const name = session.message.user.name;
        session.endConversation(message || `Oops! Something went wrong. Sorry ${name}, we need to start over (wasntme)`);
    }
];