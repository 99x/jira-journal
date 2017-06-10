'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const auth = require('../services/auth');

const lib = new builder.Library('worklog');

const find = (...args) => {
    const el = builder.EntityRecognizer.findEntity.call(this, ...args);
    return el ? el.entity : null;
};

const findTimePart = (entities) => {
    const entity = find.call(this, ...[entities, 'timeSpent']) || find.call(this, ...[entities, 'builtin.datetimeV2.duration']);
    if (entity) {
        return String.prototype.split.call(entity, /\s/g).join('').replace(/([mhd])/g, '$1 ').trim();
    }
    return null;
};

const findDatePart = (entities) => {
    const ResolutionProp = 'resolution';

    const entity = builder.EntityRecognizer.findEntity.call(this, ...[entities, 'builtin.datetimeV2.date']);
    const resolution = Object.prototype.hasOwnProperty.call(entity, 'resolution') ? entity[ResolutionProp] : null;
    const datetimeValues = resolution ? resolution.values : [];

    const isvalidDate = (val) => {
        const dt = new Date(val);
        if (Object.prototype.toString.call(dt) === '[object Date]') {
            return !isNaN(dt.getTime());
        }
        return false;
    };

    const date = Array.prototype.find.call(datetimeValues, (el) => {
        return el.type === 'date' ? isvalidDate.call(this, ...[el.value]) : false;
    });

    return date ? new Date(date.value) : null;
};

lib.dialog('/', [
        (session, args) => {

            if (!session.userData.profile) {
                return session.replaceDialog('greet:/');
            }

            console.log('Worklog :', JSON.stringify(args.intent.entities));

            session.dialogData.args = args;
            session.beginDialog('/task', args);
        },

        (session, results) => {

            if (!results.response) {
                return session.endDialog();
            }
            session.dialogData.task = results.response.task;
            session.dialogData.project = results.response.project;
            session.beginDialog('/time-spent', session.dialogData.args);
        },

        (session, results) => {

            if (!results.response) {
                return session.endDialog();
            }
            session.dialogData.timeSpent = results.response
            session.beginDialog('/date-started', session.dialogData.args);
        },

        (session, results, next) => {

            if (!results.response) {
                return session.endDialog();
            }
            session.dialogData.dateStarted = results.response;
            session.beginDialog('/complete', session.dialogData);
        }
    ])
    .triggerAction({
        matches: ['/worklog']
    })
    .cancelAction('/worklog-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/task', [
        (session, args, next) => {

            const {
                entities
            } = args.intent;
            const task = find.call(this, ...[entities, 'task']);

            if (task) {
                next({
                    response: String.prototype.replace.call(task, /\s/g, '')
                });
            } else {
                session.send(`I don't know *what task* to log (worry)`)
                    .endDialogWithResult({
                        resumed: builder.ResumeReason.notCompleted
                    });
            }
        },

        (session, results, next) => {

            const task = results.response;
            const {
                emailAddress
            } = session.userData.profile;

            session.sendTyping();

            auth.authorize(emailAddress, task)
                .then((response) => {
                    session.endDialogWithResult({
                        response: {
                            project: response.project,
                            task,
                        }
                    });
                })
                .catch((error) => {
                    const {
                        statusCode
                    } = error;

                    switch (statusCode) {
                        case 401:
                            session.send(`Oops! Looks like you don't have access to that project. Talk to IT Services.`);
                            break;
                        case 404:
                            session.send(`Oops! Cannot find that task. May be it doesn't exists or not created yet.`);
                            break;
                        default:
                            session.send(`Oops! Something went wrong. Shame on us! Try a bit later.`);
                            break;
                    }

                    session.endDialogWithResult({
                        resumed: builder.ResumeReason.notCompleted
                    });
                });
        }
    ])
    .cancelAction('/task-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/time-spent', [
        (session, args) => {
            const {
                entities
            } = args.intent;

            const timeSpent = findTimePart.call(this, ...[entities]);

            if (timeSpent) {
                session.endDialogWithResult({
                    response: timeSpent
                });
            } else {
                session.send(`I don't know how much *time you spent*.`)
                    .endDialogWithResult({
                        resumed: builder.ResumeReason.notCompleted
                    });
            }
        }
    ])
    .cancelAction('/time-spent-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/date-started', [
        (session, args, next) => {

            const {
                entities
            } = args.intent;
            const dateStarted = findDatePart.call(this, ...[entities]);

            if (dateStarted) {
                session.endDialogWithResult({
                    response: dateStarted.toISOString().replace('Z', '+0000')
                });
            } else {
                return session.send(`Sorry! I don't know *when you started* it (worry)`)
                    .endDialogWithResult({
                        resumed: builder.ResumeReason.notCompleted
                    });
            }
        }
    ])
    .cancelAction('/date-started-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/complete', [
    (session, args) => {

        const {
            task,
            project,
            dateStarted,
            timeSpent
        } = args;

        const {
            text
        } = session.message;

        const worklog = {
            comment: text,
            started: dateStarted,
            timeSpent: timeSpent
        };

        session.sendTyping();

        jira.addWorklog(project, task, worklog)
            .then((response) => {
                session.send('(y)')
                    .endDialog();
            })
            .catch((error) => {
                const {
                    statusCode
                } = error;

                const {
                    goodname
                } = session.userData.profile;

                switch (statusCode) {
                    case 401:
                        session.send(`Your JIRA credentials no longer working, ${goodname}. Just talk to IT Services about it.`);
                        break;

                    case 404:
                        session.send(`Oops! ${task} task doesn't exists or you don't have permission, ${goodname}.`);
                        break;

                    default:
                        session.send(`Oops! Something went wrong. Shame on us (facepalm). Let's try again in few mins.`);
                        break;
                }

                session.endDialogWithResult({
                    resumed: builder.ResumeReason.notCompleted
                });
            });
    }
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};