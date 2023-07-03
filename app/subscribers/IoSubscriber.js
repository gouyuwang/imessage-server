'use strict'
let Subscriber = require('./Subscriber');

class IoSubscriber extends Subscriber {

  constructor(client, token) {
    super()
    this.client = client;
    this.provider = 'io';
    this.token = token
  }

  getId() {
    return this.client.id
  }

  notify(event, payload) {
    this.client.emit(event, payload)
  }
}

module.exports = IoSubscriber;
