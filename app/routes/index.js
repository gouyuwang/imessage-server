'use strict';
let HttpSubscriber = require('../subscribers/HttpSubscriber');
const Hub = require('../hubs');
let bodyParser = require('body-parser');
const logger = require("../utils/Logger");
const masterChannel = process.env.MASTER_CHANNEL;
const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const utils = require('../utils');
const parseJWT = utils.parseJWT
const arrayWrap = utils.arrayWrap
const ttl = parseInt(process.env.JWT_TTL)

function generateToken(payload = {}) {

    return new Promise((resolve, reject) => {
        jwt.sign(payload, jwtSecret, (err, token) => {
            err ? reject(err) : resolve(token)
        })
    })
}

function auth(req, res, next) {
    let token = req.headers['authorization']
    jwt.verify(parseJWT(token), jwtSecret, function (err, decoded) {
        if (err) {
            res.status(401).send(err)
        } else {
            req.user = {
                _id: decoded.sub
            }
            next()
        }
    })
}

function authIfMaster(req, res, next) {
    let channels = req.body.channels || '*';
    if (arrayWrap(channels).indexOf(masterChannel) > -1) {
        auth(req, res, next)
    } else {
        next()
    }
}


module.exports = function (express) {

    express.use(bodyParser.json());

    express.post('/login', (req, res) => {
        let key = req.body.key;
        if (key === process.env.MASTER_KEY) {
            logger.info(`Client login, subscriber: ${req.body._id}`, false)
            let payload = {
                exp: Math.floor(Date.now() / 1000) + ttl,
                sub: req.body._id
            }
            generateToken(payload).then(token => res.send({
                token,
                exp: payload.exp
            })).catch(err => {
                logger.error(`Generate token error ${err}`)
                res.sendStatus(500)
            })
        } else {
            res.sendStatus(401);
        }
    });

    express.get('/channels', (req, res) => {
        res.send(Hub.channels());
    })

    express.post('/unsubscribe', (req, res) => {
        let id = req.body.id;
        let sub = new HttpSubscriber([], id);
        Hub.unsubscribe(req.body.channels || masterChannel, sub);

        logger.debug('Server unsubscribe ' + JSON.stringify(req.body), false)
        res.send('ok');
    });


    express.post('/subscribe', authIfMaster, (req, res) => {
        let id = req.body.id;
        let sub = new HttpSubscriber(req.body.hooks, id);
        Hub.subscribe(req.body.channels || masterChannel, sub);

        logger.debug('Server subscribe ' + JSON.stringify(req.body), false)
        res.send('ok');
    });

    express.post('/broadcast', authIfMaster, (req, res) => {
        let body = req.body;
        let channels = body.channels || '*';
        let event = body.event || 'message';
        let payload = body.payload || {};

        let chan = channels;
        if (channels instanceof String) {
            chan = `${channels}::${event}`;
        }

        Hub.broadcast(chan, payload);
        logger.debug('Server broadcast:' + JSON.stringify(body), false)

        res.send('ok');
    });

    express.post('/config', auth, (req, res) => {
        let body = req.body;
        Hub.setPrivates(body.privates || [])
        res.send('ok');
    })

    express.get('/user', auth, (req, res) => {
        res.send(req.user || {});
    })
}
