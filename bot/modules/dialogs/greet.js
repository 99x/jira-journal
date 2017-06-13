'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('greet');
const EmptyOrWhitespace = /\s+/;

lib.dialog('/', [
        (session, args, next) => {
            const {
                profile
            } = session.userData;

            if (profile) {
                const {
                    goodname,
                    emailAddress
                } = profile;
                return session.send(`Hi ${goodname} <${emailAddress}>... Say **help** or something else...`)
                    .endDialog();
            }

            const [goodname] = session.message.user.name.split(EmptyOrWhitespace);
            session.send(`Hello ${goodname}... Say **help** or something else...`)
                .endDialog();
        }
    ])
    .triggerAction({
        matches: ['/greet']
    });

lib.dialog('/firstrun', [
        (session, args, next) => {

            const [goodname] = session.message.user.name.split(EmptyOrWhitespace);

            const welcomeCard = new builder.HeroCard()
                .title('JIRA Journal Bot')
                .subtitle('Your bullet journal - whatever you want to log.')
                .text(`Yow ${goodname}... thanks for adding me. Say 'help' to see what I can do`)
                .images([
                    new builder.CardImage().url('https://github.com/99xt/jira-journal/wiki/icon.png').alt('jira-jouranl-bot-logo')
                ])
                .buttons([
                    builder.CardAction.openUrl(session, 'https://github.com/99xt/jira-journal', 'Github'),
                    builder.CardAction.imBack(session, 'help', 'Help')
                ]);

            session.userData.score = 1.0;
            session.send(new builder.Message(session).attachments([welcomeCard]))
                .endDialog();
        }
    ])
    .triggerAction({
        onFindAction: (context, cb) => {
            const score = (context.userData.score || 0.0) < 1.0 ? 1.1 : 0.0;
            cb(null, score);
        }
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};