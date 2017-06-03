'use strict';

const builder = require('botbuilder');
const lib = new builder.Library('reset');

lib.dialog('/', [
        (session) => {

            delete session.userData.profile;
            delete session.userData.impersonated;
            delete session.userData.authToken;
            delete session.privateConversationData.projects;

            session.endDialog(`Oops! I'm suffering from a memory loss...`);
        }
    ])
    .triggerAction({
        matches: [/^(reset|reset me|logout|sign out|start over)$/g]
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};