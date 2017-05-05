'use strict';

const builder = require('botbuilder');
const jira = require('./jira');
const auth = require('./auth');

module.exports = exports = [
    (session, results, next) => {

        const Hash = '#';
        const EmptyString = '';
        const SingleSpace = ' ';
        const HashtagExpression = /(?:^|[ ])#([a-zA-Z0-9-\.]+)/gm;

        const text = session.message.text;
        const hashtags = text.match(HashtagExpression) || [];

        if (hashtags.length == 0) {
            return session.endConversation(`Sorry! I don't know *what task* to log (worry)`);
        }

        session.privateConversationData.tagStream = hashtags
            .map(Function.prototype.call, String.prototype.trim)
            .join(SingleSpace)
            .replace(Hash, EmptyString);

        console.log('Hashtags :', session.privateConversationData.tagStream);

        next();

    },
    (session, results, next) => {

        const TaskExpression = /\d+-[A-Za-z]+(?!-?[a-zA-Z]{1,10})/g;
        const email = session.userData.profile.emailAddress;
        const tagStream = session.privateConversationData.tagStream
            .toString()
            .split(EmptyString)
            .reverse()
            .join(EmptyString);
        const tasks = tagStream.match(TaskExpression) || [];

        console.log('Tasks found:', tagStream, JSON.stringify(tasks));

        if (tasks.length != 1) {
            return session.endConversation(`Sorry! I don't know *which task* to log (worry)`);
        }

        let [logTask] = tasks;
        logTask = logTask
            .toString()
            .split(EmptyString)
            .reverse()
            .join(EmptyString);

        auth.getCredentials(email, logTask)
            .then((response) => {
                if (!response) {
                    return session.endConversation('Oops! No one from JIRA could found anything related to *${logTask}* (worry)');
                }

                session.privateConversationData.logTask = logTask;
                sessioin.privateConversationData.logProject = response.project;

                next();

            }).catch((ex) => {
                session.replaceDialog('/404', {
                    message: `Oops! Couldn't contact JIRA! Shame on us (worry)`,
                    exception: ex
                });
            });

    },
    (session, results, next) => {

        const Today = 'today';
        const DateSeparator = '-'
        const SpecificDayExpression = /(^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01]))/g;
        const DayExpression = /^today|yesterday|yday/i;
        const YesterdayExpression = /^yesterday|yday/i;

        const tagStream = session.privateConversationData.tagStream.toLowerCase();
        const days = tagStream.match(SpecificDayExpression) || tagStream.match(DayExpression) || [];
        const now = new Date();

        if (days.length > 1) {
            return session.endConversation(`Sorry! I don't know *which day* to log (worry)`)
        }

        if (days.length == 0) {
            session.send(`You didn't mention which day to log. I'm logging this as *#Today*.`);
        }
        const logDay = days[0] || Today;
        let logDate;
        if (DayExpression.test(logDay)) {
            if (YesterdayExpression.test(logDay)) {
                now.setDate(now.getDate() - 1);
            }
            logDate = now.getDate() + DateSeparator + (now.getMonth() + 1);
        }
        session.privateConversationData.logDate = logDate || logDay;

        next();

    },
    (session, results, next) => {

        const DurationExpression = /^([0-9]{2})\.([0-9]{2})(h)|^([0-9]{2})(m)|^([0-9]{1})(d)|^([0-9]{2})(h)|^([0-9]{1})\.([0-9]{1})(d)/g;
        const WholeDay = '1d';

        const tagStream = session.privateConversationData.tagStream;
        const durations = tagStream.match(DurationExpression) || [];

        if (durations.length > 1) {
            return session.endConversation(`Sorry! I don't know *how much time* to log (worry)`);
        }

        if (durations.length == 0) {
            session.send(`You didn't mention how much time to log. I'm logging this as a *Whole Day*.`);
        }
        const logDuration = durations[0] || WholeDay;

        session.privateConversationData.logDuration = logDuration;

        next();

    },
    (session, results, next) => {

        const {
            logTask,
            logProject,
            logDate,
            logDuration
        } = session.privateConversationData;
        const text = session.message.text;

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
                session.endConversation('(y)');
            })
            .catch((ex) => {
                session.replaceDialog('/404', {
                    message: `Oops! Couldn't contact JIRA! Shame on us (worry)`,
                    exception: ex
                });
            });
    }
];