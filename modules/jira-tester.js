const jira = require("./jira");

const jiraOptions = {
    url: "https://myjira.atlassian.net",
    username: "user",
    password: "password"
}

// list all issues assigned to the user
jira.getAssignedIssues(jiraOptions).then((issues) => {
    console.log(issues);
}).catch((error) => {
    console.log("Something failed");
});

// list all issues with a worklog in the past two weeks
jira.getRecentIssues(jiraOptions, 14).then((issues) => {
    console.log(issues);
}).catch((error) => {
    console.log("Something failed");
});

// add a new worklog
jira.addWorklog(jiraOptions, "CIN-27", {
    comment: "I did some work here.",
    started: "2017-04-01T09:01:46.633+0000",
    timeSpent: "1h 30m"
}).then((worklogId) => {
    console.log(`Successfully added workflow with ID: ${worklogId}`);
}).catch((error) => {
    console.log("Something failed");
});