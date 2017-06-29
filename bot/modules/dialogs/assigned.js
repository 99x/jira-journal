'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('assigned');

const empty = (arr) => {
    return !arr || arr.length === 0;
};

lib.dialog('/', [
        (session, args, next) => {

            if (!session.userData.profile) {
                return session.send(`Looks like you haven't signed in.`).replaceDialog('greet:/');
            } else if (empty.call(this, ...session.userData.jira)) {
                return session.send(`Looks like you don't have JIRA access.`).replaceDialog('greet:/');
            }

            next();
        },
        (session) => {

            const {
                name
            } = session.message.user;
            const goodname = name.split(' ').slice(0, -1).join(' ');

            session.send(`Patience ${goodname}... I am working on it. So for now, just go figure :P`)
                .endDialog();
        }
    ])
    .triggerAction({
        matches: ['/assigned']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};