'use strict';

const request = require('request');
const Promise = require("bluebird");

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    let url = `${jiraOptions.url}/rest/api/latest/${urlStub}`;
    let { username, password } = jiraOptions;

    return {
        url,
        headers: {
            'Content-Type': 'application/json'
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

function _addWorklog(jiraOptions, issueKey, worklog, callback) {
    let urlStub = `issue/${issueKey}/worklog`;
    let options = _getRequestOptions(jiraOptions, urlStub, worklog);

    request.post(options, handleResponse);

    function handleResponse(error, response, body) {
        if (error || response.statusCode !== 201) {
            error = error || new Error('Failed with ' + response.statusCode);
            return callback(error);
        }

        callback(null, body.id);
    }
}

function _getAssignedIssues(jiraOptions, callback) {
    let urlStub = `search?jql=assignee=${jiraOptions.username}&fields=summary`;
    let options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        if (error || response.statusCode !== 200) {
            if (!error) {
                error = new Error('Failed with ' + response.statusCode);
            }

            return callback(error);
        }

        let issues = _summarizeIssues(JSON.parse(body));
        callback(null, issues);
    }
}

function _getRecentIssues(jiraOptions, days, callback) {
    let urlStub = `search?jql=worklogAuthor=${jiraOptions.username}
     AND worklogDate >= -${days}d&fields=summary`;
    let options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        if (error || response.statusCode !== 200) {
            if (!error) {
                error = new Error('Failed with ' + response.statusCode);
            }

            return callback(error);
        }

        let issues = _summarizeIssues(JSON.parse(body));
        callback(null, issues);
    }
}

/* public interface */

module.exports = exports = {
    addWorklog: Promise.promisify(_addWorklog),
    getAssignedIssues: Promise.promisify(_getAssignedIssues),
    getRecentIssues: Promise.promisify(_getRecentIssues)
};