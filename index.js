'use strict';

/**
 * Load config
 */
require('dotenv').load();

const axios = require('axios');
const logger = require('./app/utils/Logger');
const express = require('express')();
const server = require('http').createServer(express);

/**
 * Socket Io Listener
 *
 * @type {{Server: Server, DisconnectReason: any, BroadcastOperator: any, RemoteSocket: any, Namespace: any, Event: any, ServerOptions: ServerOptions, Socket: any}}
 */
const io = require('socket.io')(server, {
    // CORS Request
    cors: {
        allowedHeaders  : ["Content-Type", "Authorization"],
        origin          : process.env.CORS || 'http://localhost:4000',
        credentials     : true
    },
    allowEIO3: true
});

/**
 * Add provider
 * @type {IoProvider|{}}
 */
const IoProvider = require('./app/providers/IoProvider');
const HttpProvider = require('./app/providers/HttpProvider');
const Hub = require('./app/hubs');
Hub.addProvider('io', new IoProvider(io))
Hub.addProvider('http', new HttpProvider())

/**
 * Http listener
 */
require('./app/routes')(express);

/**
 * Socket listener
 */
require('./app/events/events')(io);

/**
 * Server port | default 3000
 * @type {*|number}
 */
const port = process.env.SERVER_PORT || 3000;

/**
 * Connect master retry count | default 5
 *
 * @type {*|number}
 */
const maxRetries = process.env.MASTER_HOOK_RETRIES || 5;

/**
 * Connect master retry interval | default 3e3
 *
 * @type {*|number}
 */
const retryInterval = process.env.MASTER_HOOK_RETRY_INTERVAL || 3e3;

/**
 * Retry count
 *
 * @type {number}
 */
let retries = 0;

/**
 * Timer
 *
 * @type {null}
 */
let retryTimer = null;

/**
 * Whether request master
 *
 * @type {boolean}
 */
let masterRequested = false;

function broadcastStartUp() {
    let url = process.env.MASTER_HOST + process.env.MASTER_HOOK_PATH;
    logger.info(`Connecting master server: [${url}]`, false);
    axios.post(url, {
        event: 'io:start-up', time: new Date().getTime() / 1000
    }).then(response => {
        logger.write(`Master server respond start up hook! code ${response.status}, body: ${JSON.stringify(response.data)}`, 'silly');
        masterRequested = true;
        retryTimer && clearTimeout(retryTimer);
    }).catch(error => {
        let re = retries > 0 ? `retries: ${retries}}` : '';
        logger.warn(`Master server response error code: ${error.response.status}, body: ${JSON.stringify(error.response.data)} ${re}`);
        if (retries >= maxRetries) {
            logger.error(`Master Server can not response, please check MASTER_HOOK_PATH is right in .env`);
            masterRequested = true;
            retryTimer && clearTimeout(retryTimer);
            return error;
        }
        logger.info(`Retry after ${retryInterval / 1000} seconds`, false);

        retryTimer = setTimeout(() => {
            retries++;
            broadcastStartUp();
        }, retryInterval);
    }).catch(err => {
        logger.error(err)
    });
}

server.listen(port, () => {
    logger.info(`>>>>>>>>>>>>>> Server started, port [${port}] <<<<<<<<<<<<<<<`);
    masterRequested || broadcastStartUp();
});
