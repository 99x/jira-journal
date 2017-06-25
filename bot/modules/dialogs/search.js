'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('search');

lib.dialog('/', [
        (session) => {

            const {
                name
            } = session.message.user;
            const goodname = name.split(' ').slice(0, -1).join(' ');

            session.send(`Patience ${goodname}... I am working on **search**. So for now, just go figure :P`)
                .endDialog();
        }
    ])
    .triggerAction({
        matches: ['/search']
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};