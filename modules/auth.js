'use strict';

const request = require('request-promise-native');
const authApiUrl = process.env.AUTH_API_URL || 'http://localhost:5000/api';

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
    const url = `${authApiUrl}${urlStub}`;
    const options = {
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        json: payload
    };

    console.log('Request Options: ', JSON.stringify(options));

    return options;
};

// handles failure of HTTP requests
const handleFailure = (error) => {
    let {
        statusCode
    } = error, message;
    console.log('Exception Occured: ', JSON.stringify(arguments));
    
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