const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({
            label: 'command',
            message: false
        }),
        winston.format.printf((info) => {
            return `[${info.timestamp}] [${info.label}/${info.level.toUpperCase()}] ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error '}),
        new winston.transports.File({ filename: 'combined.log'}),
        new winston.transports.Console({
            level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.label({
                    label: 'command',
                    message: false
                }),
                winston.format.printf((info) => {
                    return winston.format.colorize({ all: true, colors: {
                        'info': 'green',
                        'warn': 'yellow',
                        'error': 'red',
                        'debug': 'white',
                        'verbose': 'blue'
                    }}).colorize(info.level, `[${info.timestamp}] [${info.label}/${info.level.toUpperCase()}] ${info.message}`)
                })
            )
        })
    ]
});

const config = require('./config.json');

ping = (message) => {
    message.channel.send('pong!');
};

stop = (message) => {
    if (message.member !== null) {
        if (message.member.roles.cache.has(config.discord.admin_role_id)) {
            logger.info("Stop command issued. Shutting down...")
            message.client.destroy();
        } else {
            logger.debug(`Stop command issued by unauthorized user ${message.author.tag}`)
        }
    } else {
        logger.warn(`Stop command issued by user ${message.author.tag} in a DM. Cancelled.`)
    }
};

const embed_generator = require('./embed_generator.js');
newAssignment = (_1, _2, channel) => {
    embed_generator.sendNewAssignment(
        channel, 
        'Edit Distance',
        'Program',
        'https://classnotes.ecs.baylor.edu/wiki/Edit_Distance',
        '3/28/2020'
    );
};
editAssignment = (_1, _2, channel) => {
    embed_generator.sendEditAssignment(
        channel, 
        'Edit Distance',
        'Program',
        'https://classnotes.ecs.baylor.edu/wiki/Edit_Distance',
        '3/28/2020',
        '3/31/2020'
    );
};
removeAssignment = (_1, _2, channel) => {
    embed_generator.sendRemoveAssignment(
        channel, 
        'Edit Distance',
        'Program',
        'https://classnotes.ecs.baylor.edu/wiki/Edit_Distance',
        '3/28/2020'
    );
};
warnAssignment = (_1, _2, channel) => {
    embed_generator.sendWarnAssignment(
        channel, 
        'Edit Distance',
        'Program',
        'https://classnotes.ecs.baylor.edu/wiki/Edit_Distance',
        '3/28/2020'
    );
};
alarmAssignment = (_1, _2, channel) => {
    embed_generator.sendAlarmAssignment(
        channel, 
        'Edit Distance',
        'Program',
        'https://classnotes.ecs.baylor.edu/wiki/Edit_Distance',
        '3/28/2020'
    );
};

function handleMessage(message, channel) {
    if (message.content.startsWith(config.discord.command_prefix)) {
        logger.info(`Command recieved: <${message.author.tag}> ${message.content}`)
        commands = {
            'ping': ping,
            'stop': stop
        }
        if (process.env.NODE_ENV !== 'production') {
            commands['new'] = newAssignment;
            commands['edit'] = editAssignment;
            commands['remove'] = removeAssignment;
            commands['warn'] = warnAssignment;
            commands['alarm'] = alarmAssignment;
        }

        parts = message.content.split(' ', 2);
        command = parts[0].substring(config.discord.command_prefix.length);
        args = parts[1];
        
        if (command in commands) {
            logger.info(`Valid command "${command}" recieved from user ${message.author.tag}.`);
            commands[command](message, args, channel);
            logger.info(`Response sent.`);
        } else {
            logger.warn(`Invalid command "${command}" recieved from user ${message.author.tag}.`);
        }
    }
}

module.exports = handleMessage;