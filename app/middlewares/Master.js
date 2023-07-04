'use strict';

/**
 * Master auth path
 *
 * @type {*|string}
 */
const path = process.env.MASTER_AUTH_PATH;

/**
 * Master port
 */
const host = process.env.MASTER_HOST;

const axios = require('axios')

class Master {
  static auth(data, token) {
    return new Promise((resolve, reject) => {
      axios.post(host + path, data, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).then(resolve).catch(err => {
        if (!err.response) {
          resolve(err.response)
        } else {
          reject(err)
        }
      })
    })
  }
}


module.exports = Master;
