'use strict';

const Promise = require('bluebird');
const request = require('request');

const options = {
    root: 'http://localhost:3948/api',
};
const signin = (email, {
    overrideOptions,
    credentials
}) => {

    request.get({
        url: `${options.root}/e/email/${email}`
    }, complete);
};

const findProject = (overrideOptions, taskId, complete) => {
    request.get({
        url: `${options.root}/e/email/${overrideOptions.email}/p/taskId/${taskId}`
    }, complete);
};

module.exports = exports = {
    auth: {
        signin: Promise.promisify(signin)
    },
    projects: {
        find: Promise.promisify(findProject)
    }
};