'use strict';

const Promise = require('bluebird');
const nodemailer = require('nodemailer');

const options = {
    host: process.env.SMTP_HOST,
    post: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD
    }
};

const transporter = nodemailer.createTransport(options);

const compose = (email) => {
    return new Promise((resolve) => {
        transporter.sendMail(email, (ex, ack) => {
            if (ex) {
                console.log('Error sending email: %s', ex.message);
            } else {
                console.log('Email sent: %s', ack.response);
                resolve(ack.response);
            }
        });
    });
};

module.exports = exports = {
    compose: compose
};