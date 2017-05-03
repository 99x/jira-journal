"use strict";

require('dotenv-extended').load();

const jira = require("./jira");
const auth = require("./auth");
const sendmail = require('./sendmail');

const jiraOptions = {
    url: "https://myjira.atlassian.net",
    username: "user",
    password: "password"
}

// list all issues assigned to the user
jira.getAssignedIssues(jiraOptions).then((issues) => {
    console.log(issues);
}).catch((error) => {
    console.log(error);
});

// list all issues with a worklog in the past two weeks
jira.getRecentIssues(jiraOptions, 14).then((issues) => {
    console.log(issues);
}).catch((error) => {
    console.log(error);
});

// add a new worklog
jira.addWorklog(jiraOptions, "CIN-27", {
    comment: "I did some work here.",
    started: "2017-04-01T09:01:46.633+0000",
    timeSpent: "1h 30m"
}).then((worklogId) => {
    console.log(`Successfully added workflow with ID: ${worklogId}`);
}).catch((error) => {
    console.log(error);
});

// checks if a user email is valid for the current application context
auth.validate("usernameOrEmail").then((response) => {
    console.log(response);
}).catch((error) => {
    console.log(error);
})

// check if the email composer works.
sendmail.compose({
    from: 'Bot <email@dress>',
    to: `KP <email@dress>`,
    subject: `Your Secret Code: BLAAHBLAAH`,
    text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: BLAAHBLAAH`,
    html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: BLAAHBLAAH</b>`
});