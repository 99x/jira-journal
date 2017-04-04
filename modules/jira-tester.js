var jira = require("./jira");

var jiraOptions = {
    url: "https://seranet.atlassian.net",
    username: "test",
    password: "test"
}

// lists all issues assigned to the user
jira.getAssignedIssues(jiraOptions, function (error, response) {
    if (error) {
        console.log("Something failed");
    }
    else {
        console.log(response);
    }
});
