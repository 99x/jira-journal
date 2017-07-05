'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');

const lib = new builder.Library('assigned');
const maxTasks = 5;

lib.dialog("/", [
    (session) => {
        session.beginDialog("fetchAssigned");
    },
    (session, results) => {
        session.beginDialog("displayTasks", results.response);
    }
]);

lib.dialog("fetchAssigned", [
    (session) => {
        const jiraOptions = {
            url: "https://myjira.atlassian.net",
            username: "user",
            password: "password"
        };

        jira.getAssignedIssues(jiraOptions).then((response) => {
            let tasks = response.map((t) => {
                return `${t.key} - ${t.summary}`;
            });

            session.endDialogWithResult({ response: tasks });
        }).catch((ex) => {
            session.send(ex);
        });

        session.sendTyping();
    }
]);

lib.dialog("displayTasks", [
    (session, args) => {
        if (args.length === 0) {
            session.endDialog("No tasks to show");
        }

        session.send(args.join("\n"));
        session.endDialog("That's all!");
    }
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};