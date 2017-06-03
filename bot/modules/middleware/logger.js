'use strict';

const logConversation = (event) => {
    console.log(`${event.address.user.name}: ${event.text}`);
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