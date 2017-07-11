"use strict";

const request = require("request-promise-native");

module.exports = exports = {
    addWorklog,
    getAssignedIssues,
    getRecentIssues,
    searchIssues
};

// adds a new worklog under a particular issue key
function addWorklog(jiraOptions, issueKey, worklog, callback) {
    const urlStub = `issue/${issueKey}/worklog`;
    const options = _getRequestOptions(jiraOptions, urlStub, worklog);

    return request
        .post(options)
        .then((response) => {
            const newWorklogId = response.id;

            return newWorklogId;
        })
        .catch(_handleFailure);
}

// gets the issues that are assigned to a particular user
function getAssignedIssues(jiraOptions) {
    const urlStub = `search?jql=assignee=${jiraOptions.username}&fields=summary`;
    const options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options)
        .then((response) => {
            const issues = _summarizeIssues(JSON.parse(response));

            return issues;
        })
        .catch(_handleFailure);
}

// gets the issues that a particular user has recently logged time under
function getRecentIssues(jiraOptions, days, callback) {
    const urlStub = `search?jql=worklogAuthor=${jiraOptions.username}
     AND worklogDate >= -${days}d&fields=summary`;
    const options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options)
        .then((response) => {
            const issues = _summarizeIssues(JSON.parse(response));

            return issues;
        })
        .catch(_handleFailure);
}

// search the issues that matches the project
function searchIssues(jiraOptions, project, callback) {
    const urlStub = `search?jql=project%20in%20('${project}')%20ORDER%20BY%20updated%20DESC&fields=summary&maxResults=10`;
    const options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options)
        .then((response) => {
            const issues = _summarizeIssues(JSON.parse(response));

            return issues;
        })
        .catch(_handleFailure);
}

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    const url = `${jiraOptions.url}/rest/api/latest/${urlStub}`;
    const {
        username,
        password
    } = jiraOptions;

    return {
        url,
        headers: {
            "Content-Type": "application/json"
        },
        auth: {
            username,
            password
        },
        json: payload
    };
}

// flattens the list of issues to a key-summary list
function _summarizeIssues(data) {
    return data.issues.map((issue) => {
        const {
            key,
            fields: {
                summary
            }
        } = issue;

        return {
            key,
            summary
        };
    });
}

// handles failure of HTTP requests
function _handleFailure(error) {
    const {
        statusCode
    } = error;
    let message;

    if (!statusCode) {
        message = error.message;
    } else {
        message = `Failed with ${statusCode}`;
    }

    return Promise.reject(error);
}