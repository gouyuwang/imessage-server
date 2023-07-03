'use strict';

/**
 * Load config
 */
require('dotenv').load();

const axios = require('axios');
const logger = require('./app/utils/Logger');
const websocket = require('socket.io');
const express = require('express')();
const server = require('http').createServer(express);
const IoProvider = require('./app/provider/IoProvider');
const HttpProvider = require('./app/provider/HttpProvider');
const Hub = require('./app/hubs');

const io = websocket.listen(server, {
    handlePreflightRequest: function (req, res) {
        let origin = req.headers['origin'] || 'http://localhost'
        let headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': true
        }
        res.writeHead(200, headers);
        res.end();
    }
});

Hub.addProvider('io', new IoProvider(io))
Hub.addProvider('http', new HttpProvider())

/**
 * Server port | default 3003
 * @type {*|number}
 */
const port = process.env.SERVER_PORT || 3003;

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


/**
 * Load router
 */
require('./app/routes')(express);

/**
 * Socket listener
 */
require('./app/events/events')(io);

app.server.listen(port, () => {
    function broadcastStartUp() {
        logger.info(`Connecting master server...`, false);
        let url = process.env.MASTER_HOST + process.env.MASTER_HOOK_PATH;
        logger.info(`Connecting [${url}]`, false);
        axios.post(url, {
            event: 'io:start-up', time: new Date().getTime() / 1000
        }).then(response => {
            logger.write(`Master respond start up hook! code ${response.status}, body : ${JSON.stringify(response.data)}`, 'silly');
            masterRequested = true;
            retryTimer && clearTimeout(retryTimer);
        }).catch(error => {
            let re = retries > 0 ? `retries: ${retries}}` : '';
            logger.warn(`Master response error! code ${error.response.status}, body : ${JSON.stringify(error.response.data)} ${re}`);
            if (retries >= maxRetries) {
                logger.error(`Server can not response start up hook, please check MASTER_HOOK_PATH is set right`);
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

    // start server
    logger.info(`>>>>>>>>>>>>>> Server started, port [${port}] <<<<<<<<<<<<<<<`);
    masterRequested || broadcastStartUp();

});

