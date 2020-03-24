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

function parseDate(dateString) {
    return "TEST DATE" + dateString;
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
                "inline": true
            }
        ]
    };
}

function getNewAssignmentMessage(title) {
    return `**:loudspeaker: NEW ASSIGNMENT HAS BEEN POSTED :loudspeaker:** ${title}`;
}

function sendNewAssignment(channel, title, type, url, date) {
    channel.send(getNewAssignmentMessage(title), { embed: getNewAssignmentEmbed(title, type, url, date) });
}

module.exports = {
    getNewAssignmentEmbed: getNewAssignmentEmbed,
    getNewAssignmentMessage: getNewAssignmentMessage,
    sendNewAssignment: sendNewAssignment
}