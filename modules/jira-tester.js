var jira = require("./jira");

var jiraUrl = "seranet.atlassian.net";
var credentials = {
    username: "user",
    password: "pw"
}

// lists all issues assigned to the user
jira.getAssignedIssues(jiraUrl, credentials, function(issues){
    console.log(issues);
});