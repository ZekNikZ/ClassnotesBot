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
const schedule = require('node-schedule');

const sqlite3 = require('sqlite3').verbose();

const embed_generator = require('./embed_generator.js');
const config = require('./config.json');

let bot = new MWBot();

function checkForUpdates(client, channel) {
    logger.info(`Checking for ClassNotes updates...`);

    let db = new sqlite3.Database('./db/assignments.db', (err) => {
        if (err) {
            logger.error('Could not connect to the assignment database');
            logger.error(err.message);
        }
        logger.debug('Connected to the assignment database.');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS assignments (
            title    VARCHAR (200) PRIMARY KEY ASC
                                NOT NULL
                                UNIQUE,
            due_date VARCHAR (20)  NOT NULL,
            type     VARCHAR (40)  NOT NULL
        );
    `);

    logger.info("Querying for pages: " + config.classnotes.pages.map(p => p.page).join(", "));
    bot.login({
        apiUrl: config.classnotes.api_path,
        username: config.classnotes.username,
        password: config.classnotes.password
    }).then((res) => {
        return bot.request({
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            titles: config.classnotes.pages.map(p => p.page).join('|'),
            redirects: 'yes',
            token: bot.token
        });
    }).then((res) => {
        logger.info('ClassNotes pages loaded successfully.')

        let foundAssignments = [];

        let anyUpdatesFound = false;
        for(let pageID of Object.keys(res.query.pages)) {
            let page = res.query.pages[pageID];

            let pageTitle = page.title.replace(/ /g, '_');
            logger.debug(`Found page "${pageTitle}"`);

            let assignmentType = config.classnotes.pages.filter(p => p.page === pageTitle)[0].name;
            logger.debug(`Mapped page name is "${assignmentType}"`);

            let lines = page.revisions[0]['*'].split('\n').filter(l => l.startsWith('[['));
            for(let line of lines) {
                let title = /(\[\[|\|)([^|]+?)\]/.exec(line)[2];
                foundAssignments.push(title);

                let dates = [...line.matchAll(/\d\d?\/\d\d?\/\d\d\d?\d?/g)].map(d => d[0]);

                logger.debug(` > "${title}": ${dates[dates.length - 1]}`);

                let sql = `SELECT title title,
                    due_date due_date,
                    type type
                    FROM assignments
                    WHERE title = ? AND type = ?`;
                db.get(sql, [title, assignmentType], (err, row) => {
                    if (err) {
                        return logger.error(err.message);
                    }

                    if (row) { // Update
                        if (row.due_date !== dates[dates.length - 1]) {
                            anyUpdatesFound = true;
                            db.run(`UPDATE assignments SET due_date=? 
                            WHERE title = ? AND type = ?
                            `, [dates[dates.length - 1], title, assignmentType], (err, r) => {
                                if (err) {
                                    return logger.error(err.message);
                                }

                                embed_generator.sendEditAssignment(
                                    channel, 
                                    row.title,
                                    row.type,
                                    `https://classnotes.ecs.baylor.edu/wiki/${row.title.replace(/ /g, '_')}`,
                                    row.due_date,
                                    dates[dates.length - 1]
                                );                                

                                logger.info(`Assignment "${title}" due date changed: ${row.due_date} -> ${dates[dates.length - 1]}`)
                            });
                        }

                        return console.log(row);
                    } else { // Add new row
                        anyUpdatesFound = true;
                        db.run(`INSERT INTO assignments(title, due_date, type)
                        VALUES(?, ?, ?)
                        `, [title, dates[dates.length - 1], assignmentType], (err, r) => {
                            if (err) {
                                return logger.error(err.message);
                            }

                            embed_generator.sendNewAssignment(
                                channel, 
                                title,
                                assignmentType,
                                `https://classnotes.ecs.baylor.edu/wiki/${title.replace(/ /g, '_')}`,
                                dates[dates.length - 1]
                            );
                            logger.info(`New assignment "${title}" added to database.`);
                        });

                        return;// logger.info(`No assignment found with the title "${title}"`);
                    }
                });
            }
        }

        db.all(`SELECT * FROM assignments`, [], (err, rows) => {
            let deletions = rows.map(r => r.title).filter(a => !foundAssignments.includes(a));

            for (let assignment of deletions) {
                logger.info(`Assignment "${assignment}" was removed.`);
                // TODO: do something about it
            }

            anyUpdatesFound = true;
        });

        if (anyUpdatesFound) {
            logger.info(`ClassNotes updates found.`);
        } else {
            logger.info(`No ClassNotes updates found.`);
        }

        db.close((err) => {
            if (err) {
                logger.error('Error closing the assignment database.')
                logger.error(err.message);
            }
            logger.debug('Closed the assignment database connection.');
        });
    }).catch((err) => {
        logger.warn('ClassNotes pages could not be loaded.');
        logger.warn(err);
    });

}

function enable(client, channel) {
    checkForUpdates(client, channel);
    var j = schedule.scheduleJob(`*/${config.classnotes.check_for_updates_time} * * * *`, function(fireDate){
        // console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
        checkForUpdates(client, channel);
    });
}

module.exports = { enable };