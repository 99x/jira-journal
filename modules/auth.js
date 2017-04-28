"use strict";

const request = require("request-promise-native");
const authApiUrl = "http://localhost:60323/api/";

module.exports = exports = {
    validateEmail
};

// cross-checks a user email against the auth database
function validateEmail(email) {
    let username, urlStub, options;

    try {
        username = extractUsername(email);
    }
    catch (error) {
        return handleFailure(error);
    }

    urlStub = `HCM?userId=${username}`;
    options = _getRequestOptions(urlStub);

    return request.post(options).then((response) => {
        response = JSON.parse(response);

        return {
            username: response.username,
            instances: response.jira.map((instance) => {
                return instance.name;
            })
        };
    }).catch(handleFailure);

    function extractUsername(email) {
        let indexEnd = email.indexOf("@");

        if (indexEnd < 0) {
            throw new Error("Not a proper email address");
        }

        return email.substring(0, indexEnd);
    }

    function handleFailure(error) {
        let { statusCode } = error, message;

        if (!statusCode) {
            message = error.message;
        }
        else {
            message = "User not found";
        }

        return Promise.reject(message);
    }
}

// generates the options object for HTTP requests
function _getRequestOptions(urlStub, payload) {
    let url = `${authApiUrl}${urlStub}`;

    return {
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        json: payload
    };
}