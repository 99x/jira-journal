"use strict";

const request = require("request-promise-native");

module.exports = exports = {
    addWorklog,
    getAssignedIssues,
    getRecentIssues
};

// adds a new worklog under a particular issue key
function addWorklog(jiraOptions, issueKey, worklog, callback) {
    let urlStub = `issue/${issueKey}/worklog`;
    let options = _getRequestOptions(jiraOptions, urlStub, worklog);

    return request.post(options).then((response) => {
        let newWorklogId = response.id;

        return newWorklogId;
    }).catch(_handleFailure);
}

// gets the issues that are assigned to a particular user
function getAssignedIssues(jiraOptions) {
    let urlStub = `search?jql=assignee=${jiraOptions.username}&fields=summary`;
    let options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options).then((response) => {
        let issues = _summarizeIssues(JSON.parse(response));

        return issues;
    }).catch(_handleFailure);
}

// gets the issues that a particular user has recently logged time under
function getRecentIssues(jiraOptions, days, callback) {
    let urlStub = `search?jql=worklogAuthor=${jiraOptions.username}
     AND worklogDate >= -${days}d&fields=summary`;
    let options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options).then((response) => {
        let issues = _summarizeIssues(JSON.parse(response));

        return issues;
    }).catch(_handleFailure);
}

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    let url = `${jiraOptions.url}/rest/api/latest/${urlStub}`;
    let { username, password } = jiraOptions;

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
        let { key, fields: { summary } } = issue;

        return {
            key,
            summary
        };
    });
}

// handles failure of HTTP requests
function _handleFailure(error) {
    let { statusCode } = error, message;

    if (!statusCode) {
        message = error.message;
    }
    else {
        message = `Failed with ${statusCode}`;
    }

    return Promise.reject(message);
}