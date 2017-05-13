'use strict';

const nodemailer = require('nodemailer');

const options = {
    host: 'smtp.office365.com',
    post: 587,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD
    },
    secureConnection: false,
    tls: {
        ciphers: 'SSLv3'
    }
};

const transporter = nodemailer.createTransport(options);

const compose = (email) => {
    return new Promise((resolve, reject) => {
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