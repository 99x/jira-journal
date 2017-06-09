'use strict';

const request = require('request-promise-native');
const authApiUrl = process.env.AUTH_API_URL || 'http://localhost:5000/workplace/bot';

// cross-checks a user email against the auth datastore
const authenticate = (usernameOrEmail) => {
    let urlStub, options;

    urlStub = `auth/?username=${usernameOrEmail}`;
    options = getRequestOptions(urlStub);

    return request.post(options).then((response) => {
        var {
            payload
        } = JSON.parse(response);

        return payload;

    }).catch(handleFailure);
};

// cross-check task against the auth user datastore
const authorize = (usernameOrEmail, task) => {
    let urlStub, options;
    urlStub = `user/${usernameOrEmail}/auth/?taskId=${task}`;
    options = getRequestOptions(urlStub);

    return request.post(options)
        .then((response) => {
            var {
                payload
            } = JSON.parse(response);

            return payload;
        })
        .catch(handleFailure);
};

// generates the options object for HTTP requests
const getRequestOptions = (urlStub, payload) => {
    const url = `${authApiUrl}/${urlStub}`;
    const options = {
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        json: payload
    };

    return options;
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

    return Promise.reject(error);
};

module.exports = exports = {
    authenticate,
    authorize
};