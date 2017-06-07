'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('help');

lib.dialog('/', [
        (session, args, next) => {

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

            session.beginDialog('/greet:/');
        },

        (session, args, next) => {
            session.send(`* Type **sign in** or **sign in as _your domain username/email address_** so I could log all your time report entries to JIRA.\n* Type **reset** and I will lose all the sweet memories we had together and we can start all over.\n* Type **who am I?** to figure out how much I know about you ;)`);
            session.send(`Now, if you are wondering how to report time, it's like this... You just type what you have been working, mention the **JIRA Task, Day, and the Time you spent** but the order really doesnt matter. I will tell JIRA to note it down :)`);
            session.endDialog(`For example... \n* _**CIN-27** **5/23** I just played with JIRA Journal Bot for **1h 30m**_ OR \n* _**CIN-27** Playing around the JIRA Journal Bot source **yesterday 4.5h**_ OR \n* _**Today** Troubleshooting my shame code for about **6h CIN-27**_`);
        }
    ])
    .triggerAction({
        matches: ['/help']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};