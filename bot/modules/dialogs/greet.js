'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('greet');

lib.dialog('/', [
        (session, args, next) => {

            if (session.userData.profile) {
                const {
                    goodname,
                    emailAddress
                } = session.userData.profile;

                return session.send(`Hay ${goodname}... looks like you are already signed in as **${emailAddress}** :)`)
                    .send(`Type **reset** if that's not your email and we can start over.`)
                    .send(`Or just type **help** to figure out what's next :)`)
                    .endDialog();
            }

            const {
                name
            } = session.message.user;
            const goodname = name.split(' ').slice(0, -1).join(' ');

            session.send(`Hay ${goodname}... looks like you haven't signed in yet. Say **sign in as _your domain username_** so we can proceed :)`)
                .endDialog();
        }
    ])
    .triggerAction({
        matches: ['/greet']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};