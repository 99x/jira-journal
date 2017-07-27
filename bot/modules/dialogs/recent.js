'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const lib = new builder.Library('recent');

const NO_OF_DAYS = 7;

lib.dialog("/", [
    (session) => {
        session.beginDialog("fetch:ensureProfile");
    },
    (session, results, next) => {
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            const instanceCount = results.response.length;

            if (instanceCount > 1) {
                session.beginDialog("fetch:selectJira", results.response);
            }
            else {
                session.dialogData.jiraInstance = results.response;
                next();
            }
        }
    },
    (session, results) => {
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            const instances = results.response || session.dialogData.jiraInstance;
            const args = {
                instances,
                operation: jira.getRecentIssues,
                param: NO_OF_DAYS
            };

            session.beginDialog("fetch:retrieveTasks", args);
        }
    },
    (session, results) => {
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            const args = {
                tasks: results.response
            };

            session.beginDialog("fetch:displayTasks", args);
        }
    },
    (session, results) => {
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            session.endDialogWithResult(results);
        }
    }
]).triggerAction({
    matches: ['/recent']
});

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};