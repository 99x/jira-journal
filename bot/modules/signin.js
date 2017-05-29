'use strict';

const builder = require('botbuilder');

const sendmail = require('./sendmail');
const secrets = require('./secrets');
const auth = require('./auth');

module.exports = exports = [
    (session) => {

        const { name } = session.message.user;
        builder.Prompts.text(session, `What's your domain username or office email address, ${name}?`);
    },

    (session, results, next) => {
        const usernameOrEmail = session.privateConversationData.usernameOrEmail = results.response;
        session.sendTyping();

        auth
            .authenticate(usernameOrEmail)
            .then((response) => {
                session.userData.profile = response.profile;
                session.privateConversationData.jira = response.instances;
                next();

            }).catch((ex) => {
                //console.log('Auth Exception: ', JSON.stringify(ex));
                session.send(`Oops! Something went wrong. Shame on us (facepalm). Let's start over.`);
                session.replaceDialog('/signin');
            });
    },

    (session, results, next) => {

        const { name } = session.message.user;
        const email = session.userData.profile.emailAddress;
        const secretCode = session.privateConversationData.secretCode = secrets.whisper();

        const draft = {
            to: `${name} <${email}>`,
            subject: `Your Secret Code: ${secretCode}`,
            text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: ${secretCode}`,
            html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: ${secretCode}</b>`
        };

        //console.log(`Email template: ${sendmail.options.auth.user}, ${draft.to}`);

        session.sendTyping();

        sendmail.compose(draft)
            .then(() => {

                //console.log(`Dropped an email to ${email}`);

                session.send(`Ok. I dropped you a mail to ${email}.`);
                next();

            }).catch((ex) => {

                //console.log(`Failed with error: ${ex.message}`);

                session.send(`Oops! Something went wrong with the email. Shame on us (facepalm). Let's start over.`);
                session.replaceDialog('/signin');
            });

    },
    (session) => {

        builder.Prompts.text(session, `What's the *secret code* in it?`);

    },
    (session, results, next) => {

        const { secretCode } = session.privateConversationData;
        const confirmCode = results.response;

        if (confirmCode !== secretCode) {
            session.send(`That's not the Secret Code I sent you (wonder). Let's start over.`);
            return session.replaceDialog('/signin');
        }

        next();

    },
    (session) => {
        const { jira } = session.privateConversationData;

        if (jira.length == 0) {
            return session.endConversation('Y');
        }

        const cards = jira.map((entity) => {
            return new builder.HeroCard(session)
                .title(entity.account)
                .subtitle(entity.description)
                .buttons([
                    builder.CardAction.openUrl(session, entity.url, 'Learn More')
                ])
        });
        const message = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel).attachments(cards);
        session.endConversation(message);
    }
];