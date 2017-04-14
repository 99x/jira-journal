'use strict';

module.exports = (session, args, next) => {

    let tickerNumber = Math.ceil(Math.random() * 20000);

    session.send('Your message \'%s\' was registered. Once we resolve it; we will get back to you.', session.message.text);

    session.send('Thanks for contacting our support team. Your ticket number is %s.', tickerNumber);

    session.endDialogWithResult({
        response: tickerNumber
    });
};