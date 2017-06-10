'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('recent');

lib.dialog('/', [
        (session) => {
            const {
                name
            } = session.message.user;

            session.endDialog(`Patience ${name}... I am working on it. So for now, just go figure :P`);
        }
    ])
    .triggerAction({
        matches: ['/recent']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};