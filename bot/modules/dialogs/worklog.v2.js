'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const auth = require('../services/auth');

const lib = new builder.Library('worklog');

const find = builder.EntityRecognizer.findEntity;

const findDatetime = (entities) => {
    const ResolutionProp = 'resolution';

    const datetime = find(entities, 'builtin.datetimeV2.date');
    const resolution = Object.prototype.hasOwnProperty.call(datetime, 'resolution') ? datetime[ResolutionProp] : null;
    const datetimeValues = resolution ? resolution.values : [];

    const value = datetimeValues.find((element) => {
        if (element.type === 'date') {
            const dt = new Date(element.value);
            if (Object.prototype.toString.call(dt) === '[object Date]') {
                return !isNaN(dt.getTime());
            }
        }
        return false;
    });
    return value;
};

lib.dialog('/', [
        (session, args) => {
            session.dialogData.args = args;
            session.beginDialog('/task', args);
        },

        (session, results) => {
            const {
                task,
                project
            } = results.response;

            session.dialogData.task = task;
            session.dialogData.project = project;

            session.beginDialog('/time-spent', session.dialogData.args);
        },

        (session, results) => {

            session.dialogData.timeSpent = results.response
            session.beginDialog('/date-started', session.dialogData.args);
        },

        (session, results, next) => {

            session.dialogData.dateStarted = results.response;
            session.beginDialog('/persist', session.dialogData);
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
            const task = find(entities, 'task');

            if (task) {
                next({
                    response: task
                });
            } else {
                session.endDialog(`I don't know *what task* to log (worry)`);
            }
        },

        (session, results, next) => {

            const usernameOrEmail = session.userData.profile.emailAddress;
            const task = results.response;

            auth.authorize(usernameOrEmail, task)
                .then((response) => {
                    next({
                        response: response
                    });
                })
                .catch((error) => {
                    const {
                        statusCode
                    } = error;

                    switch (statusCode) {
                        case 401:
                            session.endDialog(`Oops! Looks like you don't have access to that project. Talk to IT Services.`);
                            break;
                        case 404:
                            session.endDialog(`Oops! Cannot find that task. May be it doesn't exists or not created yet.`);
                            break;
                        default:
                            session.endDialog(`Oops! Something went wrong. Shame on us! Try a bit later.`);
                            break;
                    }
                });
        },

        (session, results) => {
            session.endDialogWithResult(results);
        }
    ])
    .cancelAction('/task-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/time-spent', [
        (session, args, next) => {
            const {
                entities
            } = args.intent;

            const timeSpent = find(entities, 'timeSpent');

            if (timeSpent) {
                next({
                    response: timeSpent
                });
            } else {
                session.send(`I don't know how much *time you spent*.`);
            }
        },
        (session, results) => {
            session.endDialogWithResult(results);
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
            const dateStarted = findDatetime(entities);

            if (dateStarted) {
                next({
                    response: dateStarted
                });
            } else {
                return session.endDialog(`Sorry! I don't know *when you started* it (worry)`)
            }
        },
        (session, results) => {
            session.endDialogWithResult(results);
        }
    ])
    .cancelAction('/date-started-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

lib.dialog('/persist', [
    (session, args) => {

        const {
            task,
            project,
            dateStarted,
            timeSpent
        } = session.dialogData;

        const {
            text
        } = session.message;

        const worklog = {
            comment: text,
            started: dateStarted,
            timeSpent: timeSpent
        };

        jira.addWorklog(project, task, worklog)
            .then((response) => {
                session.endDialog('(y)');
            })
            .catch((error) => {
                const {
                    statusCode
                } = error;

                const {
                    name
                } = session.message.user;

                switch (statusCode) {
                    case 401:
                        session.endDialog(`Your JIRA credentials no longer working, ${name}. Just talk to IT Services about it.`);
                        break;

                    case 404:
                        session.endDialog(`Oops! ${task} task doesn't exists or you don't have permission, ${name}.`);
                        break;

                    default:
                        session.endDialog(`Oops! Something went wrong. Shame on us (facepalm). Let's try again in few mins.`);
                        break;
                }
            });
    }
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};