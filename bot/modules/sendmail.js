'use strict';

const nodemailer = require('nodemailer');

const options = {
    host: 'smtp.office365.com',
    post: 587,
    auth: {
        user: process.env.SMTP_AUTH_USERNAME,
        pass: process.env.SMTP_AUTH_PASSWORD
    },
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'
    }
};

console.log('NodeMailer Configuration:', JSON.stringify(options));

const transporter = nodemailer.createTransport(options);

const compose = (email) => {
    return new Promise((resolve, reject) => {
        email.from = `BOT <${options.auth.user}>`;

        transporter.sendMail(email, (ex, ack) => {
            if (ex) {
                console.log(`Error sending email: ${ex.message}`);
                return reject(ex);
            }

            console.log(`Email sent: ${ack.response}`);
            resolve(ack.response);
        });
    });
};

module.exports = exports = {
    compose
};