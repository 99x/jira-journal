'use strict';

const builder = require('botbuilder');
const timesheet = require('./timesheet');
const sendmail = require('./sendmail');
const secrets = require('./secrets');

module.exports = exports = [(session) => {

        builder.Prompts.text(session, 'What\'s your company email address?');

    }, (session, results, next) => {

        if (results.response && /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(results.response)) {

            session.dialogData.email = results.response;
            session.dialogData.secretCode = secrets.whisper();

            next();
            return;
        }

        session.endDialog('That\'s not an email address!');

    }, (session, results, next) => {

        const email = session.dialogData.email;
        const secretCode = session.dialogData.secretCode;

        const draft = {
            from: 'Bot <noreply@jirajournal.io>',
            to: session.message.user.name + ' <' + email + '>',
            subject: 'Your Secret Code ' + secretCode,
            text: 'You just tryed to sign in with JIRA Journal. Here\'s your Secret Code: ' + secretCode,
            html: 'You just tryed to sign in with JIRA Journal. Here\'s your <b>Secret Code: </b>' + secretCode
        };

        session.sendTyping();

        sendmail.compose(draft)
            .then(() => {
                session.send('Ok. Dropped an email to %s.', results.response);
                next();

            }).catch((ex) => {
                console.log(ex);
                session.endDialog();
            });

    }, (session) => {

        builder.Prompts.text(session, 'What\'s the *secret code* in it?');

    }, (session, results, next) => {

        if (results.response && results.response === session.dialogData.secretCode) {
            next();
            return;
        }

        session.endDialog('That\'s not what I sent you! :P');

    }, (session, results, next) => {

        session.sendTyping();

        timesheet
            .searchColleagues(results.response)
            .then((colleagues) => {
                console.log('Found %s', colleagues.length);

                session.userData = colleagues[0];
                session.userData.impersonated = true;
                next();

            }).catch((ex) => {
                console.log(ex);
                session.endDialog();
            });
    },

    (session) => {

        if (session.userData.impersonated) {
            session.endDialog('(y)');
            return;
        }
        session.endDialog('Oops! Couldn\'t impersonate');
    }
];