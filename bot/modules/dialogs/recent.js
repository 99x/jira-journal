'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('recent');

lib.dialog('/', [
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
        matches: ['/recent']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};