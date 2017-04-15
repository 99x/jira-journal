'use strict';

module.exports = (session, args, next) => {
    session.endEndDialogWithResult('(poke)');
};