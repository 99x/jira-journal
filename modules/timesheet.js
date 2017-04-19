'use strict';

const Promise = require('bluebird');

module.exports = exports = {

    searchColleagues: (username) => {

        return new Promise((resolve) => {

            setTimeout(() => {

                const colleague = {
                    profile: {
                        fullname: ''
                    },
                    impersonated: false,
                };
                resolve([colleague]);
            }, 2000);
        });
    }
};