"use strict";
let Subscriber = require('./Subscriber');
const logger = require('../utils/Logger');

const axios = require('axios');

const MASTER_HOST = process.env.MASTER_HOST;

class HttpSubscriber extends Subscriber {

    constructor(hooks, id) {
        super();
        this.provider = 'http'
        this.id = id
        this.hooks = hooks
    }

    notify(event, payload) {
        let hook = this.parseEvent(event)
        if (hook !== false) {
            let m = hook[0]
            let config = {
                method: m,
                url: hook[1]
            }
            if (m.toUpperCase() === 'GET') {
                config['params'] = payload
            } else {
                config['data'] = payload
            }
            axios
                .request(config)
                .then(response => {
                    logger.debug(`Http event hook success url: [${hook[1]}] ${JSON.stringify(response.data)}`, false)
                    return response
                })
                .catch(err => {
                    logger.error(`Http event hook error url: [${hook[1]}] [${err.response.status}]`)
                })
                .catch(err => {
                    logger.error(err)
                })
        }
    }

    parseEvent(event) {
        let hook = this.hooks[event]
        if (hook !== void 0) {
            if (typeof hook === 'string') {
                return ['POST', this.parseUrl(hook)];
            } else if (hook instanceof Array) {
                return [hook[0], this.parseUrl(hook[1])];
            }
        }
        return false
    }

    parseUrl(url) {
        if (url.indexOf('http') !== 0) {
            if (url.indexOf('/') !== 0) {
                url = '/' + url
            }
            return MASTER_HOST + url;
        }
        return url;
    }

    getId() {
        return this.id;
    }
}

module.exports = HttpSubscriber;
