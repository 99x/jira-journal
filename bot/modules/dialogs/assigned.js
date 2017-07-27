"use strict";

const builder = require("botbuilder");
const jira = require("../services/jira");
const lib = new builder.Library("assigned");

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
                operation: jira.getAssignedIssues,
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
    matches: ["/assigned"]
});

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};