'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('greet');

lib.dialog('/', [
        (session, args, next) => {
            if (session.userData.profile) {
                session.beginDialog('/hi');
            } else {
                session.beginDialog('/ano');
            }
        }
    ])
    .triggerAction({
        matches: ['/greet']
    });

lib.dialog('/hi', [
    (session, args, next) => {
        const {
            name
        } = session.message.user;
        const email = session.userData.profile.emailAddress;

        session.send(`Hay ${name}... looks like you are already signed in as **${email}** :)`)
            .send(`Type **reset** if that's not your email and we can start all over.`)
            .send(`Or just type **help** to figure out what's next :)`)
            .endDialog();
    }
]);

lib.dialog('/ano', [
    (session, args, next) => {
        const {
            name
        } = session.message.user;

        session.send(`Hay ${name}...`)
            .send(`Looks like you haven't signed in yet. Say **sign in as _your domain username_** OR **_email address_** so we can proceed :)`)
            .endDialog();
    }
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};