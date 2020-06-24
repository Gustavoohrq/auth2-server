'use strict';

const connection = require("./connection");

exports.find = id => {
  connection.query('SELECT * FROM client where id=?', id, function (error, results, fields) {
    if (error) return done(new Error('Client not found'))
    else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Client not found'))
    else return done(null, results[0])
  })
}


exports.findByClientId = (clientId, done) => {
  connection.query('SELECT * FROM client where clientId=?', clientId, function (error, results, fields) {
    if (error) return done(new Error('Client not found'))
    else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Client not found'))
    else return done(null, results[0])
  })
}
