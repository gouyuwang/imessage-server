"use strict";
const ev = require('../utils/ev')
const Hub = require('../hubs')
const Util = require('../utils');
const parseJWT = Util.parseJWT
const formatError = Util.formatError
const IoSubscriber = require('../subscribers/IoSubscriber')
const masterChannel = process.env.MASTER_CHANNEL;
const enableLoginOut = process.env.ENABLE_LOGIN_OUT

function events(io) {
    io.on(ev.CONNECTION, function (client) {
        let token = parseJWT(client.handshake.headers['authorization']);
        let subscriber = new IoSubscriber(client, token)

        client.on(ev.SUBSCRIBE, data => {
            Hub.subscribe(data.channels, subscriber).catch(err => client.emit(ev.ERROR, formatError('subscribe', err)))
        })

        client.on(ev.DISCONNECT, () => {
            Hub.unsubscribe('*', subscriber)
            enableLoginOut && Hub.broadcast(masterChannel + '::logout', {token})
        })

        client.on(ev.BROADCAST, data => {
            let channels = data.channels || '*'
            Hub.broadcast(channels, data.payload, subscriber)
        })

        client.on(ev.UNSUBSCRIBE, data => {
            let channels = data.channels || '*'
            Hub.unsubscribe(channels, subscriber)
        })
    });
}

module.exports = events;
