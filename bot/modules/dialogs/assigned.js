'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');

const lib = new builder.Library('assigned');

const TASKS_PER_BATCH = 5;
const JIRA_OPTIONS = {
    url: "https://myjira.atlassian.net",
    username: "user",
    password: "password"
}

lib.dialog("/", [
    (session) => {
        session.beginDialog("fetchAssigned", JIRA_OPTIONS);
    },
    (session, results) => {
        session.beginDialog("displayTasks", results.response);
    },
    (session, results) => {
        session.endDialogWithResult(results);
    }
]);

lib.dialog("fetchAssigned", [
    (session, args) => {
        const jiraOptions = args;

        jira.getAssignedIssues(jiraOptions).then((response) => {
            const tasks = response.map((t) => {
                return `${t.key}: ${t.summary}`;
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
        const tasks = args;

        if (!tasks || tasks.length === 0) {
            session.endDialog("No tasks to show");
        }
        else if (tasks.length <= TASKS_PER_BATCH) {
            builder.Prompts.choice(session, "Select a task to proceed logging time:", tasks, builder.ListStyle.button);
        }
        else {
            const batchOfTasks = tasks.splice(0, TASKS_PER_BATCH);
            session.dialogData.remainingTasks = tasks;

            batchOfTasks.push("More");
            builder.Prompts.choice(session, "Select a task to proceed logging time:", batchOfTasks, builder.ListStyle.button);
        }

    },
    (session, results) => {
        if (results.response) {
            const selection = results.response.entity;

            if (selection.match(/^more$/i)) {
                const tasks = session.dialogData.remainingTasks;
                session.replaceDialog("displayTasks", tasks);
            } else {
                const projectKey = selection.substring(0, selection.indexOf(":"));
                session.send(projectKey);
                session.endDialogWithResult(results);
            }
        }
    },
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};