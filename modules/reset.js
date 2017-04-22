'use strict';

module.exports = exports = [(session) => {

    delete session.userData.profile;
    delete session.userData.impersonated;
    delete session.userData.projects;
    delete session.privateConversationData.history;

    session.endConversation('Oops! I am suffering from a memory loss...');
}];