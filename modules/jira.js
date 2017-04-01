var https = require("https");

/* public interface */

// returns all issues assigned to the user
module.exports.getAssignedIssues = function(jiraUrl, credentials, callback) {
    var pathStub = "search?jql=assignee=" + credentials.username + "&fields=summary";

    var options = {
        hostname: jiraUrl,
        method: "GET",
        pathStub: pathStub,
        credentials: credentials
    };

    var handleSuccess = function (response) {
        var data = [];

        response.on("data", function (chunk) {
            data.push(chunk);
        });

        response.on('end', function () {
            data = JSON.parse(data.join(''));

            callback(prepareIssueList(data));
        });
    };

    var request = _createRequest(options, handleSuccess, _handleError);
    request.end();

    function prepareIssueList(data) {
        return data.issues.map(function(issue){
            return {
                key: issue.key,
                summary: issue.fields.summary
            };
        });
    }
}

/* private methods */

// abstracts creation of HTTP request to the JIRA API
function _createRequest(options, handleSuccess, handleError) {
    var authHeaderValue = _createAuthHeaderValue(options.credentials);

    var requestOptions = {
        hostname: options.hostname,
        path: "/rest/api/latest/" + options.pathStub,
        method: options.method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": authHeaderValue
        }
    };

    return https.request(requestOptions, handleSuccess).on('error', handleError);
}

// generates the authorization header value
function _createAuthHeaderValue(credentials) {
    var string = credentials.username + ":" + credentials.password;
    return "Basic " + Buffer.from(string).toString('base64');
}

// handles network operation errors
function _handleError(error) {
    console.log("Got error: " + error.message);
}