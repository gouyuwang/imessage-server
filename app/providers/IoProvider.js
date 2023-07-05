'use strict';

let Provider = require('./Provider');
const Util = require('../utils')
const ev = require('../utils/ev')

class IoProvider extends Provider {

    constructor(io) {
        super();
        this.io = io;
    }

    broadcast(channel, payload, broadcaster) {
        if (typeof channel === 'string') {
            let ce = Provider.getChannelEvent(channel);
            if (ce[0] === '*') {
                return this.io.emit(`*::${ce[1]}`, payload);
            }
        }

        this.gatherSubscribers(channel)
            .forEach(subscriber => {
                let chanelEvent = subscriber[0];
                subscriber = subscriber[1];
                if (subscriber) {
                    let [channel, event] = chanelEvent.split('::')
                    console.log('event: ' + event)

                    if (broadcaster) {
                        this.authChannel(channel, broadcaster)
                            .then(() => {
                                subscriber.notify(chanelEvent, payload)
                            })
                            .catch(err => {
                                broadcaster.notify(ev.ERROR, Util.formatError('broadcast', err))
                            })
                    } else {
                        subscriber.notify(chanelEvent, payload)
                    }
                }
            });
    }
}

module.exports = IoProvider;
