"use strict";

require('dotenv-extended').load();

const sendmail = require('./sendmail');

// check if the email composer works.
sendmail.compose({
    from: 'Bot <email@dress>',
    to: `KP <email@dress>`,
    subject: `Your Secret Code: BLAAHBLAAH`,
    text: `You just tryed to sign in with JIRA Journal. Here's your Secret Code: BLAAHBLAAH`,
    html: `You just tryed to sign in with JIRA Journal. Here's your <b>Secret Code: BLAAHBLAAH</b>`
});