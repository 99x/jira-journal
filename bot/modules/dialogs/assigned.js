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
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            session.beginDialog("displayTasks", results.response);
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
            let message;

            switch (ex.statusCode) {
                case 401:
                    message = "It seems like your credentials aren't correct or valid anymore";
                    break;
                default:
                    message = "Something failed while fetching the assigned tasks";
                    break;
            }

            session.endDialogWithResult({
                response: message,
                resumed: builder.ResumeReason.notCompleted
            });
        });

        session.sendTyping();
    }
]);

lib.dialog("displayTasks", [
    (session, args) => {
        const tasks = args;

        if (!tasks || tasks.length === 0) {
            session.endDialogWithResult({
                response: "No tasks to show",
                resumed: builder.ResumeReason.notCompleted
            });
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

                session.endDialogWithResult({
                    response: results,
                    resumed: builder.ResumeReason.completed
                });
            }
        }
    }
]).cancelAction("cancelDisplayTasks", "Okay, cancelling..", {
    matches: /^cancel|nevermind/i
});

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};