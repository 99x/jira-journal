'use strict';

const builder = require('botbuilder');

const timesheet = require('./timesheet');
const sendmail = require('./sendmail');
const secrets = require('./secrets');

const emailValidator = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

module.exports = exports = [(session) => {

    const name = session.message.user.name;
    builder.Prompts.text(session, 'What\'s the company email, ${name}?');

}, (session, results, next) => {

    const email = session.privateConversationData.email = results.response;

    if (!emailValidator.test(email)) {
        session.send('${email}\'s not an email address! Let\'s start over.');
        return session.replaceDialog('/signin');
    }

    next();

}, (session) => {

    const name = session.message.user.name;
    const email = session.privateConversationData.email;
    const secretCode = session.privateConversationData.secretCode = secrets.whisper();

    const draft = {
        from: 'Bot <noreply@jirajournal.io>',
        to: name + ' <' + email + '>',
        subject: 'Your Secret Code ' + secretCode,
        text: 'You just tryed to sign in with JIRA Journal. Here\'s your Secret Code: ' + secretCode,
        html: 'You just tryed to sign in with JIRA Journal. Here\'s your <b>Secret Code: </b>' + secretCode
    };

    console.log('Email template: %s', draft);

    session.sendTyping();

    sendmail.compose(draft)
        .then(() => {

            console.log('Dropped an email to %s', email);

            session.send('Ok. I dropped you a mail to ${email}.');
            next();

        }).catch((ex) => {

            console.log('Failed with error: %s', ex.message);

            session.send('Oops! Something went wrong with the email. Shame on us (facepalm). Let\'s start over.');
            session.replaceDialog('/signin');
        });

}, (session) => {

    builder.Prompts.text(session, 'What\'s the *secret code* in it?');

}, (session, results, next) => {

    const secretCode = session.privateConversationData.secretCode;
    const confirmCode = results.response;

    if (confirmCode !== secretCode) {
        session.send('That\'s not the Secret Code I sent you (wonder). Let\'s start over.');
        return session.replaceDialog('/signin');
    }

    next();

}, (session) => {

    const email = session.privateConversationData.email;

    session.sendTyping();

    timesheet.colleagues
        .find(email)
        .then((response) => {

            console.log('Found %s', response.length);

            session.userData = response;
            session.userData.impersonated = true;

            session.endConversation('(y)');

        }).catch((ex) => {

            console.log('Failed with error: %s', ex.message);

            session.send('Oops! Something went wrong. Shame on us (facepalm).');
            session.send('Sorry! Let\'s start over.');
            session.replaceDialog('/signin');
        });
}];