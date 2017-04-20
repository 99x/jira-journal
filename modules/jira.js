'use strict';

const request = require('request');
const Promise = require("bluebird");

/* private methods */

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    let url = jiraOptions.url + '/rest/api/latest/' + urlStub;

    return {
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            'username': jiraOptions.username,
            'password': jiraOptions.password
        },
        json: payload
    };
}

// flattens the list of issues to a key-summary list
function _summarizeIssues(data) {
    return data.issues.map(function (issue) {
        return {
            key: issue.key,
            summary: issue.fields.summary
        };
    });
}

function addWorklog(jiraOptions, issueKey, worklog, callback) {
    let urlStub = 'issue/' + issueKey + '/worklog';
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

function getAssignedIssues(jiraOptions, callback) {
    let urlStub = 'search?jql=assignee=' + jiraOptions.username + '&fields=summary';
    let options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        let issues;

        if (error || response.statusCode !== 200) {
            if (!error) {
                error = new Error('Failed with ' + response.statusCode);
            }

            return callback(error);
        }

        issues = _summarizeIssues(JSON.parse(body));
        callback(null, issues);
    }
}

function getRecentIssues(jiraOptions, days, callback) {
    let urlStub = 'search?jql=worklogAuthor=' + jiraOptions.username +
        ' AND worklogDate >= -' + days + 'd&fields=summary';
    let options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        let issues;

        if (error || response.statusCode !== 200) {
            if (!error) {
                error = new Error('Failed with ' + response.statusCode);
            }

            return callback(error);
        }

        issues = _summarizeIssues(JSON.parse(body));
        callback(null, issues);
    }
}

/* public interface */

module.exports = exports = {
    addWorklog: Promise.promisify(addWorklog),
    getAssignedIssues: Promise.promisify(getAssignedIssues),
    getRecentIssues: Promise.promisify(getRecentIssues)
};