'use strict';

const api = require('../services/api')

module.exports.findById = async (id, done) => {
  await api.get(`aluno/obterInfo?env=unip&codPessoa=${id}`)
    .then(function (response) {
      const user = response.data
      return done(null, user)
    })
    .catch(function (error) {
      return done(new Error('User Not Found'))
    })
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
  await api.post('/auth/login?env=unip', data)
    .then(function (response) {
      const user = response.data
      return done(null, user)
    })
    .catch(function (error) {
      return done(new Error('User Not Found'))
    })
};

