var restify = require('restify');
var builder = require('botbuilder');
var settings = require('./appsettings');
//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8081, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat bot
var connector = new builder.ChatConnector(settings.bot);
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();
server.post('/bot', connector.listen());
//Bot on
bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
            .address(message.address)
            .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});
bot.on('typing', function (message) {
    // User is typing
});
bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});
//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function (content) {
    return this.indexOf(content) !== -1;
}
bot.dialog('/', intents);

intents.matches(/ping|are you alive?/i, [function (session, args, next) {
    session.send('I AM ALIVE!');
}]);

// This section willb e triggered if the message contains #
intents.matches(/(?:^|[ ])#([a-zA-Z0-9-]+)/gm, [function (session, args, next) {

    // Following variables saves the requied information to send to Jira API
    var Tasktime = "empty";
    var TaskID = "empty";
    var TaskDate = "empty";
    var TaskComment = "empty";

    //Getting the keywords starting from #
    var re = /(?:^|[ ])#([a-zA-Z0-9-\.]+)/gm;
    var str = session.message.text;
    TaskComment = str;
    var m;
    while ((m = re.exec(str)) != null) {

        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        //checking whether the given Hashtag is the Jira task
        var jiraRegX = /\d+-[A-Za-z]+(?!-?[a-zA-Z]{1,10})/g;
        var reversedText = m[0, 1].split("").reverse().join("");
        var matchedJira = reversedText.match(jiraRegX);
        if (matchedJira == null) {
            //checking whether the given hashtag is a date mm-dd
            var dateRegX = /(^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01]))/g;
            matchedDate = m[0, 1].match(dateRegX);
            if (matchedDate == null) {
                //Checking whether the given hashtag is a time nnh or nnm or nnd
                var timeRegX = /^([0-9]{2})\.([0-9]{2})(h)|^([0-9]{2})(m)|^([0-9]{1})(d)|^([0-9]{2})(h)|^([0-9]{1})\.([0-9]{1})(d)/g;
                matchedTime = m[0, 1].match(timeRegX);
                if (matchedTime == null) {
                    //Checking whether the given hashtag is today
                    if (m[0, 1].toLowerCase() == "today") {
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        console.log(m[0, 1] + " is the task date");
                        TaskDate = dd + "-" + mm;
                    } else if (m[0, 1].toLowerCase() == "yesterday") {
                        //Checking whether given hashtag is yesterday
                        var today = new Date();
                        today.setDate(today.getDate() - 1)
                        var dd = today.getDate();
                        var mm = today.getMonth() + 1; //January is 0!
                        console.log(m[0, 1] + " is the task date");
                        TaskDate = dd + "-" + mm;
                    } else {
                        console.log(m[0, 1] + " is not a valid hashtag");
                        session.send(m[0, 1] + " is not a valid hashtag. Get available Hash tags here www.google.com");
                    }
                } else {
                    console.log(m[0, 1] + " is task time");
                    Tasktime = m[0, 1];

                }
            } else {
                console.log(m[0, 1] + " is the task date");
                TaskDate = m[0, 1];

            }
        } else {
            console.log(m[0, 1] + " is the JIRA Task ID");
            TaskID = m[0, 1];

        }
        //removing the Hashtags from the message and generating the comment
        var TaskComment = TaskComment.replace(m[0, 0], "");
    }
    console.log("Task date is " + TaskDate + " | Task time is " + Tasktime + " | Task JIRA ID is " + TaskID + " | Task Comment is " + TaskComment);
    session.send("Task date is " + TaskDate + " | Task time is " + Tasktime + " | Task JIRA ID is " + TaskID + " | Task Comment is " + TaskComment);
}
]);