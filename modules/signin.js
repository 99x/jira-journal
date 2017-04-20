'use strict';

const builder = require('botbuilder');
const timesheet = require('./timesheet');

module.exports = exports = [(session) => {

    builder.Prompts.text(session, 'Please tell me your domain user?');

}, (session, results, next) => {

    session.send('Ok. Searching for your stuff...');
    session.sendTyping();

    timesheet
        .searchColleagues(results.response)
        .then((colleagues) => {
            console.log('Found %s', colleagues.length);

            session.userData = colleagues[0];
            session.userData.impersonated = true;
        }).catch((ex) => {
            console.log(ex);
        }).finally(() => {
            next();
        });

}, (session) => {

    if (!session.userData.impersonated) {
        return session.endDialog('Oops! Couldn\'t impersonate');
    }
    session.endDialog('(y)');
}];