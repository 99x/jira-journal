'use strict';

module.exports = function (session, args, next) {
    session.endEndDialogWithResult('(poke)');
};