'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const lib = new builder.Library('fetch');

const TASKS_PER_BATCH = 5;

lib.dialog("ensureProfile", [
    (session) => {
        const { profile, jira } = session.userData;

        if (!profile) {
            session.send("not_signed_in").cancelDialog(0, "greet:/");
        } else if (!jira || jira.length === 0) {
            session.send("no_jira_accounts").cancelDialog(0, "greet:/");
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

        builder.Prompts.choice(session, "jira_selection", jiraInstances, builder.ListStyle.button);
    },
    (session, results) => {
        if (results.response) {
            const selection = results.response.entity, { jiraInstances } = session.dialogData;
            let selectedInstances = [];

            if (selection.match(/^all$/i)) {
                // show tasks from all instances

                selectedInstances = Object.keys(jiraInstances)
                    .filter((key) => {
                        return key !== "All"
                    })
                    .map((instanceName) => {
                        return jiraInstances[instanceName];
                    });
            } else {
                // one selection

                selectedInstances.push(jiraInstances[selection]);
            }

            session.endDialogWithResult({ response: selectedInstances });
        }
    }
]).cancelAction("cancelSelectJira", "exit_dialog", {
    matches: /^cancel|nevermind/i
});

lib.dialog("retrieveTasks", [
    (session, args) => {
        const { instances, operation, param } = args;

        const requests = instances.map((instance) => {
            return operation(instance, param);
        });

        Promise.all(requests).then(responses => {
            const tasks = responses.reduce((tasks, response) => {
                return tasks.concat(response);
            }, []).map((task) => {
                return `${task.key}: ${task.summary}`;
            });

            session.endDialogWithResult({ response: tasks });
        }).catch(ex => {
            let response;

            switch (ex.statusCode) {
                case 401:
                    response = session.localizer.gettext(session.preferredLocale(), "auth_failure");
                    break;
                default:
                    response = session.localizer.gettext(session.preferredLocale(), "request_failure");
                    break;
            }

            session.endDialogWithResult({
                response,
                resumed: builder.ResumeReason.notCompleted
            });
        });

        session.sendTyping();
    }
]);

lib.dialog("displayTasks", [
    (session, args) => {
        const { tasks, repeat } = args;
        const promptMessage = (repeat) ? "further_task_selection" : "task_selection";

        if (!tasks || tasks.length === 0) {
            const response = session.localizer.gettext(session.preferredLocale(), "no_tasks_found");

            session.endDialogWithResult({
                response,
                resumed: builder.ResumeReason.notCompleted
            });
        }
        else if (tasks.length <= TASKS_PER_BATCH) {
            // only or last batch of tasks

            builder.Prompts.choice(session, promptMessage, tasks, builder.ListStyle.button);
        }
        else {
            // handle as a batch of tasks

            const batchOfTasks = tasks.splice(0, TASKS_PER_BATCH);
            session.dialogData.remainingTasks = tasks;

            batchOfTasks.push("More");
            builder.Prompts.choice(session, promptMessage, batchOfTasks, builder.ListStyle.button);
        }

    },
    (session, results) => {
        if (results.response) {
            const selection = results.response.entity;

            if (selection.match(/^more$/i)) {
                // repeat again for the rest

                const args = {
                    repeat: true,
                    tasks: session.dialogData.remainingTasks
                };

                session.replaceDialog("displayTasks", args);
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
]).cancelAction("cancelDisplayTasks", "exit_dialog", {
    matches: /^cancel|nevermind/i
});

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};