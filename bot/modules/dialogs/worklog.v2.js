'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const auth = require('../services/auth');

const lib = new builder.Library('worklog');

const find = builder.EntityRecognizer.findEntity;

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

            const task = find(entities, 'jiraTask');

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

            auth.authorize(usernameOrEmail, task).then(success).catch(failure);

            function success(response) {
                next({
                    response: response
                });
            }

            function failure(error) {

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
            }
        },

        (session, results) => {
            session.endDialogWithResult(results);
        }
    ])
    .cancelAction('/jira-task-cancel', '(y)', {
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
                session.endDialog('');
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
            const specifiedDay = find(args.intent.entities, 'day');
            const specificDate = find(args.intent.entities, 'datetimeV2');

            if (specifiedDay) {
                next({
                    response: convertDayToDate(specifiedDay)
                });
            } else if (specificDate) {
                next({
                    response: convertToDate(specificDate)
                });
            } else {
                return session.endDialog(`Sorry! I don't know *when you started* it (worry)`)
            }

            function convertDayToDate(d) {
                const Yesterday = /yesterday|yday/g;
                const dt = new Date();
                if (Yesterday.test(d.toLowerCase())) {
                    dt.setDate(dt.getDate() - 1);
                }
                return dt;
            }

            function convertToDate(d) {
                const dt = new Date([...d.split(/[\/.-]/g), new Date().getFullYear()]);
                return dt;
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