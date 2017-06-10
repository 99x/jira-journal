'use strict';

const builder = require('botbuilder');

const sendmail = require('../services/sendmail');
const secrets = require('../services/secrets');
const auth = require('../services/auth');

const lib = new builder.Library('signin');

const find = (...args) => {
    const el = builder.EntityRecognizer.findEntity.call(this, ...args);
    return el ? el.entity : null;
};

lib.dialog('/', [
        (session, args, next) => {

            const {
                entities
            } = args.intent;

            const usernameOrEmail = find.call(this, ...[entities, 'username']) || find.call(this, ...[entities, 'builtin.email']);

            if (!usernameOrEmail) {
                // session.send(`What's your domain username or office email address, ${goodname}?`)
                //     .beginDialog('/prompt-email');
                // builder.Prompts.customize(builder.PromptType.text, lib.dialog('/prompt-email'));
                // builder.Prompts.text(session, `What's your domain username or office email address, ${goodname}?`, {
                //     textFormat: 'plain'
                // });
                return session.send(`You need to mention your domain username also!`)
                    .endDialog();
            }

            session.dialogData.args = args;
            next({
                response: usernameOrEmail
            });
        },

        (session, results, next) => {
            const usernameOrEmail = session.dialogData.usernameOrEmail = results.response;
            session.sendTyping();

            auth
                .authenticate(usernameOrEmail)
                .then((response) => {
                    const {
                        name
                    } = response.profile;
                    response.profile.goodname = name.split(' ').slice(0, -1).join(' ');

                    session.dialogData.profile = response.profile;
                    session.dialogData.jira = response.instances;
                    next();

                }).catch((ex) => {
                    const {
                        statusCode
                    } = ex;

                    switch (statusCode) {
                        case 404:
                            session.send(`Looks like you are not in seranet. Talk to IT Services to see what's going on.`);
                            break;
                        default:
                            session.send(`Oops! Something went wrong. Shame on us (facepalm). Let's start over.`);
                            break;
                    }

                    session.endDialogWithResult({
                        resumed: builder.ResumeReason.notCompleted
                    });
                });
        },

        (session, results, next) => {

            const {
                name,
                emailAddress
            } = session.dialogData.profile;
            const secretCode = session.dialogData.secretCode = secrets.whisper();

            const draft = {
                to: `${name} <${emailAddress}>`,
                subject: `Your Secret Code: ${secretCode}`,
                text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: ${secretCode}`,
                html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: ${secretCode}</b>`
            };

            session.sendTyping();

            sendmail.compose(draft)
                .then(() => {
                    session.send(`Ok. I dropped you a mail to ${emailAddress}.`);
                    next();
                }).catch((ex) => {
                    session.send(`Oops! Something went wrong with the email. Shame on us (facepalm). Let's start over.`)
                        .replaceDialog('/', session.dialogData.args);
                });
        },

        (session) => {
            builder.Prompts.text(session, `What's the *secret code* in it?`);
        },

        (session, results, next) => {

            const {
                secretCode
            } = session.dialogData;
            const confirmCode = results.response;

            if (confirmCode !== secretCode) {
                return session.send(`That's not the Secret Code I sent you (wonder). Let's start over.`)
                    .replaceDialog('/', session.dialogData.args);
            }
            next();
        },

        (session) => {

            const {
                jira
            } = session.dialogData;

            session.userData = session.dialogData;

            if (jira.length == 0) {
                return session.send('(y)')
                    .endDialog();
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
            session.send(message)
                .send(`(y)`)
                .endDialog();
        }
    ])
    .triggerAction({
        matches: ['/signin']
    })
    .cancelAction('/signin-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

// lib.dialog('/prompt-email', new builder.SimpleDialog((session, args) => {
//         const email = session.message.text;

//         if (!session.dialogData.forwarded) {
//             session.dialogData.forwarded = true;
//             session.sendBatch();
//             return;
//         }
//         if (session.message.text) {
//             console.log(session.message);
//             session.endDialogWithResult({
//                 response: email
//             });
//         }
//     }))
//     .cancelAction('/prompt-email-cancel', '(y)', {
//         matches: [/^(cancel|nevermind)$/g]
//     });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};