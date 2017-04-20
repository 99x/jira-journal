'use strict';

const logConversation = (event) => {
    console.log('%s: %s', event.address.user.name, event.text);
};

module.exports = exports = {
    receive: (e, next) => {
        logConversation(e);
        next();
    },
    send: (e, next) => {
        logConversation(e);
        next();
    }
};