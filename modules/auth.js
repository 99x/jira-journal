'use strict';

const request = require('request-promise-native');
const authApiUrl = process.env.AUTH_API_URL || 'http://localhost:64480/api';

// cross-checks a user email against the auth database
const validate = (usernameOrEmail) => {
    let urlStub, options;

    urlStub = `/e/username/${usernameOrEmail}`;
    options = getRequestOptions(urlStub);

    return request.post(options).then((response) => {
        response = JSON.parse(response);

        return response;

    }).catch(handleFailure);
};

const getCredentials = (usernameOrEmail, task) => {
    let urlStub, options;
    urlStub = `/e/username/${usernameOrEmail}/jira/task/${task}`;
    options = getRequestOptions(urlStub);

    return request.post(options)
        .then((response) => {
            response = JSON.parse(response);

            return response;
        })
        .catch(handleFailure);
};

// generates the options object for HTTP requests
const getRequestOptions = (urlStub, payload) => {
    let url = `${authApiUrl}${urlStub}`;

    return {
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        json: payload
    };
};

// handles failure of HTTP requests
const handleFailure = (error) => {
    let {
        statusCode
    } = error, message;

    if (!statusCode) {
        message = error.message;
    } else {
        message = `Failed with ${statusCode}`;
    }

    return Promise.reject(message);
};

module.exports = exports = {
    validate,
    getCredentials
};