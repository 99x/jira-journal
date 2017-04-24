'use strict';

const builder = require('botbuilder');
const timesheet = require('./timesheet');
const jira = require('./jira');

module.exports = exports = [(session, results, next) => {

    const Hash = '';
    const EmptyString = '';
    const SingleSpace = ' ';
    const HashtagExpression = /(?:^|[ ])#([a-zA-Z0-9-\.]+)/gm;

    const text = session.message.text;
    const hashtags = text.match(HashtagExpression) || [];

    if (hashtags.length == 0) {
        return session.endConversation('Sorry! I don\'t know *what task* to log (worry)');
    }

    session.privateConversationData.tagStream = hashtags
        .map(Function.prototype.call, String.prototype.trim)
        .join(SingleSpace)
        .replace(Hash, EmptyString);

    next();

}, (session, results, next) => {

    const TaskExpression = /\d+-[A-Za-z]+(?!-?[a-zA-Z]{1,10})/g;

    const userToken = session.userData.authToken;
    const tagStream = session.privateConversationData.tagStream;
    const tasks = tagStream.match(TaskExpression) || [];
    let logTask;

    if (tasks.length != 1) {
        return session.endConversation('Sorry! I don\'t know *which task* to log (worry)');
    }
    logTask = tasks[0];

    timesheet.tasks
        .find({
            userToken: userToken
        }, logTask)
        .then((response) => {
            if (!response) {
                return session.endConversation('Oops! No one from JIRA could found anything related to *${taskId}* (worry)');
            }

            session.privateConversationData.logTask = logTask;
            sessioin.privateConversationData.logTaskInstance = response;
            next();

        }).catch((ex) => {
            session.endConversation('Oops! Couldn\'t contact JIRA! Shame on us (worry)');
        });

}, (session, results, next) => {

    const Today = 'Today';
    const DateSeparator = '-'
    const SpecificDayExpression = /(^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01]))/g;
    const DayExpression = /^today|Today|TODAY|yesterday|Yesterday|YESTERDAY|yday|Yday|YDAY/i;
    const YesterdayExpression = /^yesterday|Yesterday|YESTERDAY|yday|Yday|YDAY/i;

    const tagStream = session.privateConversationData.tagStream;
    const days = tagStream.match(SpecificDayExpression) || tagStream.match(DayExpression) || [];
    const now = new Date();
    let logDay;
    let logDate;

    if (days.length > 1) {
        return session.endConversation('Sorry! I don\'t know *which day* to log (worry)')
    }

    if (days.length == 0) {
        session.send('You didn\'t mention which day to log. I\'m logging this as *#Today*.');
    }
    logDay = days[0] || Today;

    if (DayExpression.test(logDay)) {
        if (YesterdayExpression.test(logDay)) {
            now.setDate(now.getDate() - 1);
        }
        logDate = now.getDate() + DateSeparator + (now.getMonth() + 1);
    }
    session.privateConversationData.logDate = logDate || logDay;

    next();

}, (session, results, next) => {

    const DurationExpression = /^([0-9]{2})\.([0-9]{2})(h)|^([0-9]{2})(m)|^([0-9]{1})(d)|^([0-9]{2})(h)|^([0-9]{1})\.([0-9]{1})(d)/g;
    const WholeDay = '1d';

    const tagStream = session.privateConversationData.tagStream;
    const durations = tagStream.match(DurationExpression) || [];
    let logDuration;

    if (durations.length > 1) {
        return session.endConversation('Sorry! I don\'t know *how much time* to log (worry)')
    }

    if (durations.length == 0) {
        session.send('You didn\'t mention how much time to log. I\'m logging this as a *Whole Day*.');
    }
    logDuration = durations[0] || WholeDay;

    session.privateConversationData.logDuration = logDuration;

    next();

}, (session, results, next) => {

    const logTask = session.privateConversationData.logTaskInstance;
    const logDate = session.privateConversationData.logDate;
    const logDuration = session.privateConversationData.logDuration;
    const text = session.message.text;

    const options = {
        url: logTask.url,
        username: logTask.username,
        password: logTask.password
    };
    const worklog = {
        comment: text,
        started: logDate,
        timeSpent: logDuration
    };

    jira.addWorklog(options, logTask.taskId, worklog)
        .then((response) => {
            session.endConversation('(y)');
        })
        .catch((ex) => {
            session.endConversation('Oops! Couldn\'t contact JIRA! Shame on us (worry)');
        });
}];