'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const auth = require('../services/auth');

const Hash = /#/g;
const EmptyString = '';
const SingleSpace = ' ';
const lib = new builder.Library('worklog');

lib.dialog('/', [
        (session, results, next) => {

            const HashtagExpression = /(?:^|[ ])#([a-zA-Z0-9-\./]+)/g;

            const {
                text
            } = session.message;
            const hashtags = text.match(HashtagExpression) || [];

            if (hashtags.length == 0) {
                return session.endDialog(`Sorry! I don't know *what task* to log (worry)`);
            }

            session.privateConversationData.tagStream = hashtags
                .map(Function.prototype.call, String.prototype.trim)
                .join(SingleSpace)
                .replace(Hash, EmptyString);

            next({
                response: session.privateConversationData.tagStream
            });

        },

        (session, results, next) => {

            const TaskExpression = /\d+-[A-Za-z]+(?!-?[a-zA-Z]{1,10})/g;
            const email = session.userData.profile.emailAddress;
            const tagStream = results.response.toString()
                .split(EmptyString)
                .reverse()
                .join(EmptyString);
            const tasks = tagStream.match(TaskExpression) || [];

            if (tasks.length != 1) {
                return session.endDialog(`Sorry! I don't know *which task* to log (worry)`);
            }

            let [logTask] = tasks;
            logTask = logTask
                .toString()
                .split(EmptyString)
                .reverse()
                .join(EmptyString);

            auth.authorize(email, logTask)
                .then((response) => {

                    session.privateConversationData.logTask = logTask;
                    session.privateConversationData.logProject = response.project;

                    next();

                }).catch((ex) => {
                    const {
                        statusCode
                    } = ex;
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

        (session, results, next) => {

            const Yesterday = 'yesterday';
            const DateSeparator = '-'
            const SpecificDateExpression = /\b(0?[1-9]|1[0-2])[\/.-](0?[1-9]|[12][0-9]|3[01])\b/g;
            const DayExpression = /today|yesterday|yday/g;
            const YesterdayExpression = /yesterday|yday/g;

            const tagStream = session.privateConversationData.tagStream.toLowerCase();
            const days = tagStream.match(SpecificDateExpression) || tagStream.match(DayExpression) || [];

            if (days.length > 1) {
                return session.endDialog(`Sorry! I don't know *which day* to log (worry)`)
            }

            if (days.length == 0) {
                session.send(`You didn't mention which day to log. I'm logging this as *#${Yesterday}*.`);
            }
            const logDay = days[0] || Yesterday;
            const logDayAsDate = SpecificDateExpression.test(logDay) ? new Date([...logDay.split(/[\/.-]/g), new Date().getFullYear()]) : new Date();
            if (DayExpression.test(logDay)) {
                if (YesterdayExpression.test(logDay)) {
                    logDayAsDate.setDate(logDayAsDate.getDate() - 1);
                }
            }
            session.privateConversationData.logDate = logDayAsDate.toISOString().replace('Z', '+0000');

            next();
        },

        (session, results, next) => {

            const DurationExpression = /\b(?:\d{1,2}\.\d{1}|\d+)(d)|(?:\d{1,2}\.\d{1,2}|\d+)(h)|(?:\d{1,2})(m)\b/g;
            const WholeDay = '1d';

            const {
                tagStream
            } = session.privateConversationData;
            const durations = tagStream.match(DurationExpression) || [];

            if (durations.length > 1) {
                return session.endDialog(`Sorry! I don't know *how much time* to log (worry)`);
            }

            if (durations.length == 0) {
                session.send(`You didn't mention how much time to log. I'm logging this as a *Whole Day*.`);
            }
            const logDuration = durations[0] || WholeDay;

            session.privateConversationData.logDuration = logDuration.replace(/([mhd])/g, '$1 ').trim();

            next();

        },

        (session, results, next) => {

            const {
                logTask,
                logProject,
                logDate,
                logDuration
            } = session.privateConversationData;

            const {
                text
            } = session.message;

            const options = {
                url: logProject.url,
                username: logProject.username,
                password: logProject.password
            };

            const worklog = {
                comment: text,
                started: logDate,
                timeSpent: logDuration
            };

            jira.addWorklog(options, logTask, worklog)
                .then((response) => {
                    session.endDialog('(y)');
                })
                .catch((ex) => {
                    const {
                        statusCode
                    } = ex;
                    const {
                        name
                    } = session.message.user;

                    switch (statusCode) {
                        case 401:
                            session.endDialog(`Your JIRA credentials no longer working, ${name}. Just talk to IT Services about it.`);
                            break;

                        case 404:
                            session.endDialog(`Oops! ${logTask} task doesn't exists or you don't have permission, ${name}.`);
                            break;

                        default:
                            session.endDialog(`Oops! Something went wrong. Shame on us (facepalm). Let's try again in few mins.`);
                            break;
                    }
                });
        }
    ])
    .triggerAction({
        matches: [/(?:^|[ ])#([a-zA-Z0-9-\./]+)/g]
    })
    .cancelAction('/worklog-cancel', '(y)', {
        matches: [/^(cancel|nevermind)$/g]
    });

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};