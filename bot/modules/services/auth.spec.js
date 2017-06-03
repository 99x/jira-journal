'use strict';

require('dotenv-extended').load();

const auth = require('./auth');

// checks if a user email is valid for the current application context
// auth.authenticate('usernameOrEmail').then((response) => {
//     console.log(response);
// }).catch((error) => {
//     console.log(error);
// });

auth.authorize('kosalap@99x.lk', 'cin-27').then((response) => {
    console.log('authorize.then', response);
}).catch(() => {
    console.log('authorize.catch', arguments);
});