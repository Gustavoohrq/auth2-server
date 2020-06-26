'use strict';

const db = require('./db');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { BasicStrategy } = require('passport-http');
const { Strategy: ClientPasswordStrategy } = require('passport-oauth2-client-password');
const { Strategy: BearerStrategy } = require('passport-http-bearer');
const validate = require('./validate');

passport.use(new LocalStrategy(
  (username, password, done) => {
    db.users.findByUsername(username, password, (error, user) => {
      if (error) return done(error);
      return done(null, user);
    });
  }
));

/**
 * BasicStrategy & ClientPasswordStrategy
 */
passport.use(new BasicStrategy((clientId, clientSecret, done) => {
  db.clients.findByClientId(clientId, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });

}));

/**
 * Client Password strategy
 */
passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
  db.clients.findByClientId(clientId, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
}));

/**
 * BearerStrategy
 */
passport.use(new BearerStrategy((accessToken, done) => {
  db.accessTokens.find(accessToken)
    .then(token => validate.token(token, accessToken))
    .then(token => done(null, token, { scope: '*' }))
    .catch(() => done(null, false));
}));

// Register serialialization and deserialization functions.

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.users.findById(id, (error, user) => done(error, user));
});
