var jira = require("./jira");

var jiraOptions = {
    url: "https://myjira.atlassian.net",
    username: "user",
    password: "password"
}

// list all issues assigned to the user
jira.getAssignedIssues(jiraOptions, function (error, response) {
    if (error) {
        console.log("Something failed");
    }
    else {
        console.log(response);
    }
});

// list all issues with a worklog in the past two weeks
jira.getRecentIssues(jiraOptions, 14, function (error, response) {
    if (error) {
        console.log("Something failed");
    }
    else {
        console.log(response);
    }
});

// add a new worklog
jira.addWorklog(jiraOptions, "CIN-27", {
    comment: "I did some work here.",
    started: "2017-04-01T09:01:46.633+0000",
    timeSpent: "1h 30m"
}, function (error, response) {
    if (error) {
        console.log("Something failed");
    }
    else {
        console.log(response);
    }
});
