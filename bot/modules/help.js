'use strict';

const builder = require('botbuilder');

module.exports = exports = [
    (session) => {

        const card = new builder.HeroCard(session)
            .title('JIRA Journal Bot')
            .text('Your bullet journal - whatever you want to log.')
            .images([
                builder.CardImage.create(session, 'https://github.com/99xt/jira-journal/wiki/icon.png')
            ]);

        const reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.list)
            .attachments([card]);
            
        session.send(reply);

        const { name } = session.message.user;

        session.send(`Hey ${name}... first things first, you need to sign in, in order to do following things`);
        session.send(`* Type **sign in** so I could log all your time report entries to JIRA.\n* Type **reset** and I will lose all the sweet memories we had together and we can start all over.\n* Type **who am I?** to figure out how much I know about you ;)`);
        session.send(`Now let's get down to what I can do with your JIRA instances.\n* Type **recent** and I will list all your recent JIRA Tasks.\n* Type **my tasks** and I will list all the JIRA tasks assigned to you.`);
        session.send(`Now, if you are wondering how to report time, it's like this... You just type what you have been done, and then use the **#tags** to mention the **JIRA Task, Day, and the Time you spent**, then just enter, and I will tell JIRA to note it down :)`);
        session.endConversation(`Something like this... \n* _I just played with JIRA Journal Bot **#CIN-27 #3/27 #2d3h45m**_ OR \n* _**#CIN-27** Playing around the JIRA Journal Bot source **#yesterday #4.5h**_`);
    }
];