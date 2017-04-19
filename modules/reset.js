'use strict';

module.exports = exports = [(session) => {

    delete session.userData.profile;
    delete session.userData.impersonated;
    delete session.userData.projects;
    delete session.privateConversationData.history;

    session.endDialog('Oops! I am suffering from a memory loss...');
}];