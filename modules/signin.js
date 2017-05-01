'use strict';

const builder = require('botbuilder');

const timesheet = require('./timesheet');
const sendmail = require('./sendmail');
const secrets = require('./secrets');

const emailValidator = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

module.exports = exports = [
    (session) => {

        const name = session.message.user.name;
        builder.Prompts.text(session, `What's the company email, ${name}?`);

    },
    (session, results, next) => {

        const email = results.response;
        session.privateConversationData.email = email;

        if (!emailValidator.test(email)) {
            session.send(`${email}'s not an email address! Let's start over.`);
            return session.replaceDialog('/signin');
        }

        next();

    },
    (session) => {

        const name = session.message.user.name;
        const email = session.privateConversationData.email;
        const secretCode = secrets.whisper();
        session.privateConversationData.secretCode = secretCode;

        const draft = {
            from: 'Bot <noreply@jirajournal.io>',
            to: `${name} <${email}>`,
            subject: `Your Secret Code: ${secretCode}`,
            text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: ${secretCode}`,
            html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: ${secretCode}</b>`
        };

        console.log(`Email template: ${draft}`);

        session.sendTyping();

        sendmail.compose(draft)
            .then(() => {

                console.log(`Dropped an email to ${email}`);

                session.send(`Ok. I dropped you a mail to ${email}.`);
                next();

            }).catch((ex) => {

                console.log(`Failed with error: ${ex.message}`);

                session.send(`Oops! Something went wrong with the email. Shame on us (facepalm). Let's start over.`);
                session.replaceDialog('/signin');
            });

    },
    (session) => {

        builder.Prompts.text(session, `What's the *secret code* in it?`);

    },
    (session, results, next) => {

        const secretCode = session.privateConversationData.secretCode;
        const confirmCode = results.response;

        if (confirmCode !== secretCode) {
            session.send(`That's not the Secret Code I sent you (wonder). Let's start over.`);
            return session.replaceDialog('/signin');
        }

        next();

    },
    (session, results, next) => {

        const email = session.privateConversationData.email;

        session.sendTyping();

        seranet.auth
            .signin(email)
            .then((response) => {

                console.log(`Found ${response.length}`);

                session.userData = {
                    impersonated,
                    profile,
                    authToken
                } = response;

                session.privateConversationData = {
                    projects
                } = response;

                next();

            }).catch((ex) => {

                console.log(`Failed with error: ${ex.message}`);

                session.send('Oops! Something went wrong. Shame on us (facepalm).');
                session.send(`Sorry! Let's start over.`);

                session.replaceDialog('/signin');
            });
    },
    (session) => {
        const {
            projects
        } = session.privateConversationData;

        if (projects.length == 0) {
            return session.endConversation('Y');
        }
        projects.forEach((entity, index) => {
            // Show the carrosal of projects.
        });
        session.endConversation();
    }
];