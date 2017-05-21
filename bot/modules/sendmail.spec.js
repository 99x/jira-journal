"use strict";

require('dotenv-extended').load();

const sendmail = require('./sendmail');
const snail = {
    name: process.env.SMTP_AUTH_USER,
    email: process.env.SMTP_AUTH_USERNAME,
    password: process.env.SMTP_AUTH_PASSWORD
};
console.log('Mailer', snail.name, snail.email, snail.password);

// check if the email composer works.
sendmail.compose({
    from: `${snail.name} <${snail.email}>`,
    to: `kosalap@99x.lk`,
    subject: `Your Secret Code: BLAAHBLAAH`,
    text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: BLAAHBLAAH`,
    html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: BLAAHBLAAH</b>`
}).then(() => {
    console.log(`Dropped an email to ${snail.email}`);
}).catch(() => {
    console.log(`Failed sending ${snail.email} with error:`, JSON.stringify(arguments));
});;