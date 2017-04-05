var request = require("request");

/* public interface */

// returns all issues assigned to the user
module.exports.getAssignedIssues = function (jiraOptions, callback) {
    var urlStub = "search?jql=assignee=" + jiraOptions.username + "&fields=summary";
    var options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        var issues;

        if (error || response.statusCode !== 200) {
            if (!error) {
                error = new Error("Failed with " + response.statusCode);
            }

            return callback(error);
        }

        issues = prepareIssues(JSON.parse(body));
        callback(null, issues);

        function prepareIssues(data) {
            return data.issues.map(function (issue) {
                return {
                    key: issue.key,
                    summary: issue.fields.summary
                };
            });
        }
    }
}

// adds a new worklog for an issue
module.exports.addWorklog = function (jiraOptions, issueKey, worklog, callback) {
    var urlStub = "issue/" + issueKey + "/worklog";
    var options = _getRequestOptions(jiraOptions, urlStub, worklog);

    request.post(options, handleResponse);

    function handleResponse(error, response, body) {
        if (error || response.statusCode !== 201) {
            error = error || new Error("Failed with " + response.statusCode);
            return callback(error);
        }

        callback(null, body.id);
    }
}

/* private methods */

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    var url = jiraOptions.url + "/rest/api/latest/" + urlStub;

    return {
        url: url,
        headers: {
            "Content-Type": "application/json"
        },
        auth: {
            "username": jiraOptions.username,
            "password": jiraOptions.password
        },
        json: payload
    };
}