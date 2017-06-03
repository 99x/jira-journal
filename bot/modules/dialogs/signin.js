'use strict';

const builder = require('botbuilder');

const sendmail = require('../services/sendmail');
const secrets = require('../services/secrets');
const auth = require('../services/auth');

const lib = new builder.Library('signin');
lib.dialog('/', [
        (session) => {

            const {
                name
            } = session.message.user;
            builder.Prompts.text(session, `What's your domain username or office email address, ${name}?`);
        },

        (session, results, next) => {
            const usernameOrEmail = session.privateConversationData.usernameOrEmail = results.response;
            session.sendTyping();

            auth
                .authenticate(usernameOrEmail)
                .then((response) => {
                    session.privateConversationData.profile = response.profile;
                    session.privateConversationData.jira = response.instances;
                    next();
                }).catch((ex) => {
                    const {
                        statusCode
                    } = ex;

                    switch (statusCode) {
                        case 404:
                            session.endDialog(`Looks like you are not in seranet. Talk to IT Services to see what's going on.`);
                            break;
                        default:
                            session.endDialog(`Oops! Something went wrong. Shame on us (facepalm). Let's start over.`);
                            break;
                    }
                });
        },

        (session, results, next) => {

            const {
                name
            } = session.message.user;
            const email = session.privateConversationData.profile.emailAddress;
            const secretCode = session.privateConversationData.secretCode = secrets.whisper();

            const draft = {
                to: `${name} <${email}>`,
                subject: `Your Secret Code: ${secretCode}`,
                text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: ${secretCode}`,
                html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: ${secretCode}</b>`
            };

            session.sendTyping();

            sendmail.compose(draft)
                .then(() => {
                    session.send(`Ok. I dropped you a mail to ${email}.`);
                    next();
                }).catch((ex) => {
                    session.send(`Oops! Something went wrong with the email. Shame on us (facepalm). Let's start over.`);
                    session.replaceDialog('/signin');
                });

        },
        (session) => {

            builder.Prompts.text(session, `What's the *secret code* in it?`);

        },
        (session, results, next) => {

            const {
                secretCode
            } = session.privateConversationData;
            const confirmCode = results.response;

            if (confirmCode !== secretCode) {
                session.send(`That's not the Secret Code I sent you (wonder). Let's start over.`);
                return session.replaceDialog('/signin');
            }

            next();

        },
        (session) => {

            const {
                jira
            } = session.privateConversationData;

            session.userData = session.privateConversationData;

            if (jira.length == 0) {
                return session.endDialog('(y)');
            }

            const jiraCards = jira.map((entity) => {
                return new builder.HeroCard(session)
                    .title(entity.account)
                    .subtitle(entity.description)
                    .buttons([
                        builder.CardAction.openUrl(session, entity.url, 'Learn More')
                    ])
            });
            const message = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel).attachments(jiraCards);
            session.endDialog(message);
        }
    ])
    .triggerAction({
        matches: [/^(sign in|login)$/g]
    })
    .cancelAction('/signin-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};