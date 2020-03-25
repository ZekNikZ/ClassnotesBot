// const embed = {
//     "color": 3495910,
//     "timestamp": "2020-03-24T03:40:17.679Z",
//     "footer": {
//         "text": "This message was posted:"
//     },
//     "fields": [
//         {
//             "name": "Assignment Title",
//             "value": "Edit Distance",
//             "inline": true
//         },
//         {
//             "name": "Assignment Type",
//             "value": "Program",
//             "inline": true
//         },
//         {
//             "name": "ClassNotes URL",
//             "value": "[Edit Distance](google.com)",
//             "inline": true
//         },
//         {
//             "name": "Due Date",
//             "value": "March **20**, 2020 at 11:59pm CDT",
//             "inline": true
//         }
//     ]
// };
// channel.send("**:pencil: :loudspeaker: :alarm_clock: ASSIGNMENT DUE DATE HAS CHANGED :alarm_clock: :pencil: :loudspeaker:** Edit Distance", { embed });

const moment = require('moment');

function parseDate(dateString) {
    if (dateString === undefined) {
        return '_No due date has been set for this assignment._'
    }

    m = moment(dateString, [ "MM-DD-YYYY", "MM-DD-YY", "M-D-YYYY", "M-D-YY" ]);
    if (!dateString.includes(":")) {
        m.hour(23).minutes(59).seconds(0);
    }
    return m.format("dddd, MMMM D, YYYY") + " at " + m.subtract(2, 'hours').format("h:mm a") + " PDT / " + m.add(2, 'hours').format("h:mm a") + ' CDT';
}

function getNewAssignmentEmbed(title, type, url, date) {
    return {
        "color": 3134241,
        "timestamp": new Date().toISOString(),
        "footer": {
            "text": "This message was posted:"
        },
        "fields": [
            {
                "name": "Assignment Title",
                "value": `${title}`,
                "inline": true
            },
            {
                "name": "Assignment Type",
                "value": `${type}`,
                "inline": true
            },
            {
                "name": "ClassNotes URL",
                "value": `[${title}](${url})`,
                "inline": true
            },
            {
                "name": "Due Date",
                "value": parseDate(date),
                "inline": false
            }
        ]
    };
}

function getNewAssignmentMessage(title) {
    return `**:loudspeaker:   NEW ASSIGNMENT HAS BEEN POSTED   :loudspeaker:**      _${title}_`;
}

function sendNewAssignment(channel, title, type, url, date) {
    channel.send(getNewAssignmentMessage(title), { embed: getNewAssignmentEmbed(title, type, url, date) });
}

function getEditAssignmentEmbed(title, type, url, oldDate, newDate) {
    return {
        "color": 4886754,
        "timestamp": new Date().toISOString(),
        "footer": {
            "text": "This message was posted:"
        },
        "fields": [
            {
                "name": "Assignment Title",
                "value": `${title}`,
                "inline": true
            },
            {
                "name": "Assignment Type",
                "value": `${type}`,
                "inline": true
            },
            {
                "name": "ClassNotes URL",
                "value": `[${title}](${url})`,
                "inline": true
            },
            {
                "name": "Due Date",
                "value": '~~' + parseDate(oldDate) + '~~\n**' + parseDate(newDate) + '**',
                "inline": false
            }
        ]
    };
}

function getEditAssignmentMessage(title) {
    return `**:pencil:   ASSIGNMENT DUE DATE HAS CHANGED   :pencil:**      _${title}_`;
}

function sendEditAssignment(channel, title, type, url, oldDate, newDate) {
    channel.send(getEditAssignmentMessage(title), { embed: getEditAssignmentEmbed(title, type, url, oldDate, newDate) });
}

function getRemoveAssignmentEmbed(title, type, url, date) {
    return {
        "color": 13632027,
        "timestamp": new Date().toISOString(),
        "footer": {
            "text": "This message was posted:"
        },
        "fields": [
            {
                "name": "Assignment Title",
                "value": `${title}`,
                "inline": true
            },
            {
                "name": "Assignment Type",
                "value": `${type}`,
                "inline": true
            },
            // {
            //     "name": "ClassNotes URL",
            //     "value": `[${title}](${url})`,
            //     "inline": true
            // },
            {
                "name": "Due Date",
                "value": '~~' + parseDate(date) + '~~',
                "inline": false
            }
        ]
    };
}

function getRemoveAssignmentMessage(title) {
    return `**:no_entry_sign:   ASSIGNMENT HAS BEEN REMOVED   :no_entry_sign:**      _${title}_`;
}

function sendRemoveAssignment(channel, title, type, url, date) {
    channel.send(getRemoveAssignmentMessage(title), { embed: getRemoveAssignmentEmbed(title, type, url, date) });
}

function getWarnAssignmentEmbed(title, type, url, date) {
    return {
        "description": "**If you have not started this assignment, do so now!**",
        "color": 16312092,
        "timestamp": new Date().toISOString(),
        "footer": {
            "text": "This message was posted:"
        },
        "fields": [
            {
                "name": "Assignment Title",
                "value": `${title}`,
                "inline": true
            },
            {
                "name": "Assignment Type",
                "value": `${type}`,
                "inline": true
            },
            {
                "name": "ClassNotes URL",
                "value": `[${title}](${url})`,
                "inline": true
            },
            {
                "name": "Due Date",
                "value": parseDate(date),
                "inline": false
            }
        ]
    };
}

function getWarnAssignmentMessage(title) {
    return `**:date:   ASSIGNMENT IS DUE IN ONE DAY   :date:**      _${title}_`;
}

function sendWarnAssignment(channel, title, type, url, date) {
    channel.send(getWarnAssignmentMessage(title), { embed: getWarnAssignmentEmbed(title, type, url, date) });
}

function getAlarmAssignmentEmbed(title, type, url, date) {
    return {
        "description": "**Make sure to put your name on it!**",
        "color": 16098851,
        "timestamp": new Date().toISOString(),
        "footer": {
            "text": "This message was posted:"
        },
        "fields": [
            {
                "name": "Assignment Title",
                "value": `${title}`,
                "inline": true
            },
            {
                "name": "Assignment Type",
                "value": `${type}`,
                "inline": true
            },
            {
                "name": "ClassNotes URL",
                "value": `[${title}](${url})`,
                "inline": true
            },
            {
                "name": "Due Date",
                "value": parseDate(date),
                "inline": false
            }
        ]
    };
}

function getAlarmAssignmentMessage(title) {
    return `**:alarm_clock:   ASSIGNMENT IS DUE IN ONE HOUR   :alarm_clock:**      _${title}_`;
}

function sendAlarmAssignment(channel, title, type, url, date) {
    channel.send(getAlarmAssignmentMessage(title), { embed: getAlarmAssignmentEmbed(title, type, url, date) });
}

module.exports = {
    getNewAssignmentEmbed: getNewAssignmentEmbed,
    getNewAssignmentMessage: getNewAssignmentMessage,
    sendNewAssignment: sendNewAssignment,
    getEditAssignmentEmbed: getEditAssignmentEmbed,
    getEditAssignmentMessage: getEditAssignmentMessage,
    sendEditAssignment: sendEditAssignment,
    getRemoveAssignmentEmbed: getRemoveAssignmentEmbed,
    getRemoveAssignmentMessage: getRemoveAssignmentMessage,
    sendRemoveAssignment: sendRemoveAssignment,
    getWarnAssignmentEmbed: getWarnAssignmentEmbed,
    getWarnAssignmentMessage: getWarnAssignmentMessage,
    sendWarnAssignment: sendWarnAssignment,
    getAlarmAssignmentEmbed: getAlarmAssignmentEmbed,
    getAlarmAssignmentMessage: getAlarmAssignmentMessage,
    sendAlarmAssignment: sendAlarmAssignment,
}