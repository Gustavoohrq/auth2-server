'use strict';

const api = require('../services/api')

const users = [{
  id: '1',
  username: 'bob',
  password: 'secret',
  name: 'Bob Smith',
}, {
  id: '2',
  username: 'joe',
  password: 'password',
  name: 'Joe Davis',
}];


module.exports.findById = (id, done) => {
  console.log(id)
  for (let i = 0, len = users.length; i < len; i++) {
    if (users[i].id === id) return done(null, users[i]);
  }
  return done(new Error('User Not Found'));
};


/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */

module.exports.findByUsername = async (username, password, done) => {
  const data = {
    'numero_ra': username,
    'password': password
  }
  console.log(username, password)
  await api.post('/auth/login?env=unip', data)
    .then(function (response) {
      const user = response.data
      return done(null, user)
    })
    .catch(function (error) {
      return done(new Error('User Not Found'))
    })
};

