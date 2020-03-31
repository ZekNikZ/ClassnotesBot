'use strict';

const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({
            label: 'bot',
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
                    label: 'bot',
                    message: false
                }),
                winston.format.printf((info) => {
                    return winston.format.colorize({ all: true, colors: {
                        'info': 'blue',
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

const pkg = require('./package.json');

logger.info(`ClassNotesBot version ${pkg.version} by Matthew McCaskill`);

const Discord = require('discord.js');
const config = require('./config.json');
const commandHandler = require("./commands.js")
const classnotesHooks = require('./module_classnotes.js');

// Create an instance of a Discord client
logger.info('Creating Discord bot client...');
const client = new Discord.Client();
let announcement_channel = null;
let channel = null;

// Ready event
client.on('ready', async () => {
    logger.info(`Connected to Discord servers as ${client.user.tag}.`)

    if (config.discord.test_message) {
        logger.info(`Attempting to post test message...`);
    }
    let foundChannel = false;
    for (let guild of client.guilds.cache.array()) {
        if (guild.channels.cache.has(config.discord.announcement_channel_id)) {
            logger.debug("Configured channel exists.")

            channel = guild.channels.resolve(config.discord.announcement_channel_id);

            if (channel.type !== 'text') {
                logger.error(`Configured channel is not a guild-level text channel (Type: "${channel.type})".`);
                client.destroy();
            } else {
                logger.debug('Configured channel is a guild-level text channel.')
                foundChannel = true;
            }

            if (config.discord.test_message) {
                logger.debug('Attempting to post test message...');
                await channel.send("Bot connected.").then(async (message) => {
                    logger.info("Test message posted successfully.");
                    logger.info("Deleting test message...");
                    await message.delete().catch((err) => {
                        logger.error("Could not delete test message.")
                        logger.error(err);
                        client.destroy();
                    });
                    logger.info("Test message deleted succesfully.")
                }).catch((err) => {
                    logger.error("Could not post test message.")
                    logger.error(err);
                    client.destroy();
                });
            }

            if (config.discord.change_nickname) {
                logger.info('Attempting to change nickname...');
                await (await guild.members.fetch(client.user)).setNickname(config.discord.nickname)
                .then(() => {
                    logger.info(`Bot nickname changed to ${config.discord.nickname}.`);
                }).catch(err => {
                    logger.warn('Nickname could not be changed.')
                });
            }

            announcement_channel = channel;

            if (config.classnotes.enabled) {
                classnotesHooks.enable(client, announcement_channel);
            }
        } else {
            logger.warn(`Bot is part of guild "${guild.name}" which does not include the configured announcement channel.`)
        }
    }
    if (!foundChannel) {
        logger.error("Could not connect to configured text channel.");
        client.destroy();
    }

    logger.info("ClassNotesBot is ready.")
});

// Message listener
client.on('message', (message) => commandHandler(message, announcement_channel));

client.login(config.discord.token).catch(err => logger.error("Invalid discord token."));
