var request = require("request");

/* public interface */

// returns all issues assigned to the user
module.exports.getAssignedIssues = function (jiraOptions, callback) {
    var urlStub = "search?jql=assignee=" + jiraOptions.username + "&fields=summary";
    var options = _getRequestOptions(jiraOptions, urlStub);

    request.get(options, handleResponse);

    function handleResponse(error, response, body) {
        var issues;

        if (error) {
            callback(error);
        }
        else if (response.statusCode !== 200) {
            callback(new Error("Failed with " + response.statusCode));
        }
        else {
            issues = prepareIssues(JSON.parse(body));
            callback(null, issues);
        }

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

/* private methods */

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub) {
    var url = jiraOptions.url + "/rest/api/latest/" + urlStub;

    return {
        url: url,
        headers: {
            "Content-Type": "application/json"
        },
        auth: {
            "username": jiraOptions.username,
            "password": jiraOptions.password
        }
    };
}