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