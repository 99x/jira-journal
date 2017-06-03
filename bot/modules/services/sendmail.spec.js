"use strict";

require('dotenv-extended').load();

const sendmail = require('./sendmail');
const options = sendmail.options;

console.log('Mailer', JSON.stringify(options.auth));

// check if the email composer works.
sendmail.compose({
    to: `kosalap@99x.lk`,
    subject: `Your Secret Code: BLAAHBLAAH`,
    text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: BLAAHBLAAH`,
    html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: BLAAHBLAAH</b>`
}).then(() => {
    console.log(`Dropped an email to ${options.auth.user}`);
}).catch(() => {
    console.log(`Failed sending ${options.auth.user} with error:`, JSON.stringify(arguments));
});;