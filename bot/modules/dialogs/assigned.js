'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('assigned');

lib.dialog('/', [
        (session) => {
            const {
                name
            } = session.message.user;

            session.endDialog(`Patience ${name}... I am working on it. So for now, just go figure :P`);
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