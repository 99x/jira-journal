'use strict';

const builder = require('botbuilder');

module.exports = exports = [
    (session, results, next) => {
        const { message, exception } = results;

        const name = session.message.user.name;
        session.send(message || `Oops! Your credentials no longer working, ${name}. We need to start over (wasntme)`);
        session.replaceDialog('/signin');
    }
];