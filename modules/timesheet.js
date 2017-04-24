'use strict';

const Promise = require('bluebird');

const findColleague = (email) => {

};
const findTask = (options, taskId) => {

};

module.exports = exports = {
    colleagues: {
        find: Promise.promisify(findColleague)
    },
    tasks: {
        find: Promise.promisify(findTask)
    }
};