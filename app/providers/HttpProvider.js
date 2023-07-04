'use strict'

let Provider = require('./Provider')
const Util = require('../utils')
const ev = require('../utils/ev')

class HttpProvider extends Provider {

    constructor() {
        super()
    }

    broadcast(channel, payload) {
        this.gatherSubscribers(channel)
            .forEach(subscriber => {
                let event = ev.MESSAGE;
                if (subscriber instanceof Array) {
                    event = subscriber[0];
                    Util.arrayWrap(subscriber[1]).map(sub => sub.notify(event.split('::')[1], payload))
                } else {
                    subscriber.notify(event, payload)
                }
            });
    }

    indexOfSubscriber(subscriber) {
        return this.subscribers.indexOf(this.subscribers.filter(sub => sub.getId() === subscriber.getId())[0])
    }
}

module.exports = HttpProvider;
