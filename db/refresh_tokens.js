'use strict';

const connection = require("./connection");
const { v1: uuidv1 } = require('uuid');
const dateFormat = require('dateformat')


module.exports.removeByUserIdAndClientId = (userId, clientId, done) => {
    connection.query('SELECT * FROM refresh_token userId=?', userId, function (error, results, fields) {
        if (error) return done(new Error('User not found'))
        else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('User not found'))
        connection.query('DELETE FROM refresh_token token = ?', [results[0].token], function (error, results, fields) {
            if (error) return done(new Error('Token Not Found'))
            return done(null);
        });
    })
};

module.exports.find = (key, done) => {
    connection.query('SELECT * FROM refresh_token where token=?', key, function (error, results, fields) {
        if (error) return done(new Error('Token Not Found'))
        else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Token Not Found'))
        return done(null, results[0]);
    })
};

module.exports.findByUserIdAndClientId = (userId, clientId, done) => {
    connection.query('SELECT * FROM refresh_token where ?', { userId, clientId }, function (error, results, fields) {
        if (error) return done(new Error('Token Not Found'))
        else if (results[0] === '' || results[0] === undefined || results[0] === null) return done(new Error('Token Not Found'))
        return done(null, results[0]);
    })
};

module.exports.save = async (token, userId, clientId, done) => {
    const id = uuidv1();
    const created_at = dateFormat(new Date(), "yyyy-mm-dd HH:MM");
    
    connection.query('SELECT * FROM refresh_token where userId=?', userId, function (error, results, fields) {
        const sql = connection.query("INSERT INTO refresh_token SET ? ", {
            id,
            token,
            created_at,
            userId,
            clientId
        }, function (error, results, fields) { return done() })
        if (error) return sql
        else if (results[0] === '' || results[0] === undefined || results[0] === null) return sql
        else {
            connection.query('DELETE FROM refresh_token where id = ?', results[0].id, function (erro, results, fields) {
                return sql;
            });
        }
    })
};







