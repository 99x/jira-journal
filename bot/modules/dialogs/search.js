'use strict';

const builder = require('botbuilder');
const jira = require('../services/jira');
const lib = new builder.Library('search');

const empty = (arr) => {
    return !arr || arr.length === 0;
};

const find = (...args) => {
    const el = builder.EntityRecognizer.findEntity.call(this, ...args);
    return el ? el.entity : null;
};

lib.dialog('/', [
        (session, args) => {

            if (!session.userData.profile) {
                return session.send(`Looks like you haven't signed in.`).replaceDialog('greet:/');
            } else if (empty.call(this, ...session.userData.jira)) {
                return session.send(`Looks like you don't have JIRA access.`).replaceDialog('greet:/');
            }

            session.beginDialog('/prepare', args);
        },

        (session, results) => {

            if (!results.response) {
                return session.endDialogWithResult({
                    resumed: builder.ResumeReason.notCompleted
                });
            }

            session.dialogData.queries = results.response;
            session.beginDialog('/query', session.dialogData);
        },

        (session, results) => {

            if (!results.response) {
                return session.endDialogWithResult({
                    resumed: builder.ResumeReason.notCompleted
                });
            }
            session.dialogData.results = results.response;
            session.beginDialog('/complete', session.dialogData);
        }
    ])
    .triggerAction({
        matches: ['/search']
    });

lib.dialog('/prepare', [
    (session, args, next) => {
        const query = find.call(this, ...[args.intent.entities, 'query']);
        if (query) {
            next({
                response: query
            });
        } else {
            session.send(`I couldn't figure out what to search (wasntme)`)
                .endDialogWithResult({
                    resumed: builder.ResumeReason.notCompleted
                });
        }
    },

    (session, results) => {
        const query = results.response;

        session.sendTyping();

        const queries = session.userData.jira.map((instance) => {
            return {
                criteria: query,
                project: instance
            };
        });

        session.endDialogWithResult({
            response: queries
        });
    }
]);

lib.dialog('/query', [
    (session, args, next) => {
        const {
            goodname
        } = session.userData.profile;

        session.dialogData.queries = args.queries;
        session.dialogData.current = args.current || 0;

        const query = session.dialogData.queries[session.dialogData.current];

        session.sendTyping();

        jira.searchIssues(query.project, query.criteria)
            .then((response) => {
                response = response || [];

                query.results = response.map((issue) => {
                        return `* ${issue.key} - ${issue.summary}`;
                    })
                    .join('\n');

                next();
            })
            .catch((error) => {
                const {
                    statusCode
                } = error;

                switch (statusCode) {
                    case 400:
                        query.results = `* Couldn't find anything on ${query.project.name}`;
                        break;
                    case 401:
                        query.results = `Your JIRA credentials no longer working, ${goodname}. Just talk to IT Services about it.`;
                        break;

                    case 404:
                        query.results = `Oops! ${query.project.name} doesn't exists or you don't have permission, ${goodname}.`;
                        break;

                    default:
                        query.results = `* Couldn't find anything cause of this error ${error.statusCode}`;
                        break;
                }
                next();
            });
    },

    (session) => {
        session.dialogData.current++;
        if (session.dialogData.current >= session.dialogData.queries.length) {
            return session.endDialogWithResult({
                response: session.dialogData.queries
            });
        }
        session.replaceDialog('/query', session.dialogData);
    }
]);

lib.dialog('/complete', [
    (session, args) => {

        session.sendTyping();

        const {
            results
        } = args;
        const message = results.map((query) => {
                return `*${query.project.name}*${'\n'}${query.results}${'\n'}`;
            })
            .join('');

        session.send(message)
            .endDialog();
    }
]);

module.exports = exports = {
    createNew: () => {
        return lib.clone();
    }
};