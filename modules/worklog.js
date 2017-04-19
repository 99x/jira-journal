'use strict';

const builder = require('botbuilder');
const jira = require('./modules/jira');
const intents = new builder.IntentDialog();

// This section willb e triggered if the message contains #
intents.matches(/(?:^|[ ])#([a-zA-Z0-9-]+)/gm, [(session, args, next) => {

    // Following variables saves the requied information to send to Jira API
    let Tasktime = 'empty';
    let TaskID = 'empty';
    let TaskDate = 'empty';
    let TaskComment = 'empty';

    //Getting the keywords starting from #
    const re = /(?:^|[ ])#([a-zA-Z0-9-\.]+)/gm;
    let str = session.message.text;
    TaskComment = str;
    let m;
    while ((m = re.exec(str)) != null) {
        session.sendTyping();

        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        //checking whether the given Hashtag is the Jira task
        const jiraRegX = /\d+-[A-Za-z]+(?!-?[a-zA-Z]{1,10})/g;
        let reversedText = m[0, 1].split('').reverse().join('');
        let matchedJira = reversedText.match(jiraRegX);
        if (matchedJira == null) {
            //checking whether the given hashtag is a date mm-dd
            const dateRegX = /(^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01]))/g;
            matchedDate = m[0, 1].match(dateRegX);
            if (matchedDate == null) {
                //Checking whether the given hashtag is a time nnh or nnm or nnd
                const timeRegX = /^([0-9]{2})\.([0-9]{2})(h)|^([0-9]{2})(m)|^([0-9]{1})(d)|^([0-9]{2})(h)|^([0-9]{1})\.([0-9]{1})(d)/g;
                matchedTime = m[0, 1].match(timeRegX);
                if (matchedTime == null) {
                    //Checking whether the given hashtag is today
                    if (m[0, 1].toLowerCase() == 'today') {
                        let today = new Date();
                        let dd = today.getDate();
                        let mm = today.getMonth() + 1; //January is 0!
                        console.log(m[0, 1] + ' is the task date');
                        TaskDate = dd + '-' + mm;
                    } else if (m[0, 1].toLowerCase() == 'yesterday') {
                        //Checking whether given hashtag is yesterday
                        let today = new Date();
                        today.setDate(today.getDate() - 1)
                        let dd = today.getDate();
                        let mm = today.getMonth() + 1; //January is 0!
                        console.log(m[0, 1] + ' is the task date');
                        TaskDate = dd + '-' + mm;
                    } else {
                        console.log(m[0, 1] + ' is not a valid hashtag');
                        session.send(m[0, 1] + ' is not a valid hashtag. Get available Hash tags here www.google.com');
                    }
                } else {
                    console.log(m[0, 1] + ' is task time');
                    Tasktime = m[0, 1];

                }
            } else {
                console.log(m[0, 1] + ' is the task date');
                TaskDate = m[0, 1];

            }
        } else {
            console.log(m[0, 1] + ' is the JIRA Task ID');
            TaskID = m[0, 1];

        }
        //removing the Hashtags from the message and generating the comment
        let TaskComment = TaskComment.replace(m[0, 0], '');
    }

    console.log('Task date is ' + TaskDate + ' | Task time is ' + Tasktime + ' | Task JIRA ID is ' + TaskID + ' | Task Comment is ' + TaskComment);
    session.send('Task date is ' + TaskDate + ' | Task time is ' + Tasktime + ' | Task JIRA ID is ' + TaskID + ' | Task Comment is ' + TaskComment);
}]);

module.exports = exports = intents;