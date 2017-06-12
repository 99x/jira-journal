'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('help');

const helpers = [{
        title: 'JIRA Journal Bot',
        subtitle: 'Your bullet journal - whatever you want to log.',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'hi'
    },
    {
        title: 'Sign In',
        subtitle: 'sign in as your-username',
        description: 'Provide your domain username to verify available JIRA instances.',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'sign in'
    },
    {
        title: 'Time Report',
        subtitle: 'I just played myself for 2h 30m Today CIN-27',
        description: 'Report time on JIRA. Must mention the Task ID, the Date - mm/dd, Yesterday, or Today, - and the Spent time just like you do in JIRA.',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'I just played myself for 2h 30m Today CIN-27'
    },
    {
        title: 'My Tasks',
        subtitle: 'what are my tasks?',
        description: 'List 3-5 JIRA Tasks assigned to you.',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'what are my tasks?'
    },
    {
        title: 'Recent Tasks',
        subtitle: 'what are my recent tasks?',
        description: 'List 3-5 JIRA Tasks you recently used.',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'what are my recent tasks?'
    },
    {
        title: 'Delete Session',
        subtitle: 'reset',
        description: 'Sign out and clear all your cache from the bot. Note that whatever you have logged on JIRA will remain :P',
        image: 'https://github.com/99xt/jira-journal/wiki/icon.png',
        trynow: 'reset'
    }
];

lib.dialog('/', [
        (session) => {

            const helperCards = helpers.map((yelp) => {
                return new builder.HeroCard(session)
                    .title(yelp.title)
                    .subtitle(yelp.subtitle)
                    .text(yelp.description || '')
                    .images([
                        builder.CardImage.create(session, yelp.image).alt('jira-jouranl-bot-logo')
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, yelp.trynow, 'Try Now')
                    ]);
            });

            const reply = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(helperCards);

            console.log(reply);

            session.send(reply)
                .endDialog();
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