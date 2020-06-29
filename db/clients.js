'use strict';

const connection = require("./connection");

module.exports.findById = (id, done) => {
  connection.query('SELECT * FROM client where id=?', id, function (error, results, fields) {
    if (error) return done(new Error('Client not found'))
    else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Client not found'))
    else return done(null, results[0])
  })
}


module.exports.findByClientId = (clientId, done) => {
  connection.query('SELECT * FROM client where clientId=?', clientId, function (error, results, fields) {
    var client = results[0]
    if (error) return done(new Error('Client not found'))
    else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Client not found'))
    else return done(null, client)
  })
}
