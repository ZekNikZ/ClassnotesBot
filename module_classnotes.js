const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({
            label: 'classnotes',
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
                    label: 'classnotes',
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

const MWBot = require('mwbot');
const sqlite3 = require('sqlite3').verbose();
const schedule = require('node-schedule');

const embed_generator = require('./embed_generator.js');
const config = require('./config.json');

function checkForUpdates(client, channel) {
    logger.info(`Checking for ClassNotes updates...`)
}

function enable(client, channel) {
    let bot = new MWBot();
    bot.login({
        apiUrl: config.classnotes.api_path,
        username: config.classnotes.username,
        password: config.classnotes.password
    }).then((res) => {
        // console.log(res);

        return bot.request({
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            titles: config.classnotes.pages.map(p => p.page).join('|'),
            redirects: 'yes',
            token: bot.token
        });
    }).then((res) => {
        // console.log(res.query.pages);
        logger.info('ClassNotes pages loaded successfully.')

        var j = schedule.scheduleJob(`*/${config.classnotes.check_for_updates_time} * * * *`, function(fireDate){
            // console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
            checkForUpdates(client, channel);
        });
        logger.info("ClassNotes checker scheduled.")

        checkForUpdates(client, channel);
    }).catch((err) => {
        logger.error('ClassNotes pages could not be loaded.');
        client.destroy();
    });
}

module.exports = { enable };