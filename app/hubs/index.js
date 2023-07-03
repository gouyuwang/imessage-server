'use strict';

class Hub {

  static subscribe(channels, subscriber) {
    let provider = Hub.findProvider(subscriber);
    return provider.subscribe(channels, subscriber);
  }

  static findProvider(subscriber) {
    Hub.initProviders();
    let p = subscriber.provider;
    let provider = Hub.providers[p];
    if (provider === undefined) {
      throw Error(`Can not find provider [${p}]`);
    }
    return provider;
  }

  static addProvider(name, provider) {
    Hub.initProviders();
    Hub.providers[name] = provider;
  }

  static initProviders() {
    if (void 0 === Hub.providers) {
      Hub.providers = {};
    }
  }

  static broadcast(channel, payload, broadcaster) {
    Hub.initProviders();
    for (let p in Hub.providers) {
      if (Hub.providers.hasOwnProperty(p)) {
        Hub.providers[p].broadcast(channel, payload, broadcaster);
      }
    }
  }

  static unsubscribe(channels, subscriber) {
    let provider = Hub.findProvider(subscriber);
    return provider.unsubscribe(channels, subscriber);
  }

  static initPrivates() {
    if (Hub.privates === undefined) {
      Hub.privates = [];
    }
    return Hub.privates;
  }

  static subscribers() {
    Hub.initProviders();
    let subs = [];
    for (let p in Hub.providers) {
      if (Hub.providers.hasOwnProperty(p)) {
        subs = subs.concat(Hub.providers[p].subscribers);
      }
    }
    return subs;
  }

  static channels() {
    Hub.initProviders();
    let chans = {};
    for (let p in Hub.providers) {
      if (chans[p] === undefined) {
        chans[p] = []
      }
      if (Hub.providers.hasOwnProperty(p)) {
        let channels = []
        for (let c in Hub.providers[p].channels) {
          let subscribers = Hub.providers[p].channels[c]
          let ssIds = [];
          subscribers.map(sub => {
            let s = Hub.providers[p].subscribers[sub]
            s && ssIds.push(s.getId())
          })
          channels.push({
            channel: c,
            subscribers: ssIds
          })
        }

        chans[p] = chans[p].concat(channels);
      }
    }
    return chans;
  }

  static setPrivates(privates) {
    Hub.privates = privates.map(p => {
      let copy = p
      let args = []
      copy.match(/\{.*?\}/g).forEach(m => {
        p = '^' + p.replace(m, '(.*?)') + '$'
        args.push(m.replace('{', '').replace('}', ''))
      })
      return [p, args]
    })
  }

  static getPrivates() {
    return Hub.initPrivates();
  }

}

module.exports = Hub;
