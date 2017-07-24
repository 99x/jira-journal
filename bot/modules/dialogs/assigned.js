'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const lib = new builder.Library('assigned');
const TASKS_PER_BATCH = 5;

lib.dialog("/", [
    (session) => {
        session.beginDialog("ensureProfile");
    },
    (session, results, next) => {
        if (builder.ResumeReason[results.resumed] === "notCompleted") {
            session.endDialog(results.response);
        }
        else {
            const instanceCount = results.response.length;

            if (instanceCount > 1) {
                session.beginDialog("selectJira", results.response);
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
            const jiraInstance = results.response || session.dialogData.jiraInstance;
            session.beginDialog("fetchAssigned", jiraInstance);
        }
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
]).triggerAction({
    matches: ['/assigned']
});

lib.dialog("ensureProfile", [
    (session) => {
        const { profile, jira } = session.userData;

        if (!profile) {
            session.send("Looks like you aren't signed-in. Sending you back..").cancelDialog("assigned:/", "greet:/");
        } else if (!jira || jira.length === 0) {
            session.send("Looks like you don't have any JIRA accounts registered. Sending you back..").cancelDialog("assigned:/", "greet:/");
        }

        session.endDialogWithResult({ response: jira });
    }
]);

lib.dialog("selectJira", [
    (session, args) => {
        const jiraInstances = args.reduce((map, instance) => {
            map[instance.name] = instance;
            return map;
        }, {});

        session.dialogData.jiraInstances = jiraInstances;
        jiraInstances.All = {};

        builder.Prompts.choice(session, "Which JIRA instance do you want to use?", jiraInstances, builder.ListStyle.button);
    },
    (session, results) => {
        if (results.response) {
            const selection = results.response.entity, { jiraInstances } = session.dialogData;
            let selectedInstances;

            if (selection.match(/^all$/i)) {
                selectedInstances = Object.keys(jiraInstances)
                    .filter((key) => {
                        return key !== "All"
                    })
                    .map((instanceName) => {
                        return jiraInstances[instanceName];
                    });
            } else {
                selectedInstances.push(jiraInstances[selection]);
            }

            session.endDialogWithResult({ response: selectedInstances });
        }
    }
]).cancelAction("cancelSelectJira", "Okay, taking you back..", {
    matches: /^cancel|nevermind/i
});

lib.dialog("fetchAssigned", [
    (session, args) => {
        const selectedInstances = args;

        const requests = selectedInstances.map((instance) => {
            return jira.getAssignedIssues(instance);
        });

        Promise.all(requests).then(responses => {
            const tasks = responses.reduce((tasks, response) => {
                return tasks.concat(response);
            }, []).map((task) => {
                return `${task.key}: ${task.summary}`;
            });

            session.endDialogWithResult({ response: tasks });
        }).catch(ex => {
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
                const { remainingTasks } = session.dialogData;

                session.replaceDialog("displayTasks", remainingTasks);
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
]).cancelAction("cancelDisplayTasks", "Okay, taking you back..", {
    matches: /^cancel|nevermind/i
});

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};