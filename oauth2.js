'use strict';

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

const config = require('./config');
const db = require('./db');
const login = require('connect-ensure-login');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const utils = require('./utils');
const validate = require('./validate');

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Configured expiresIn
const expiresIn = { expires_in: config.token.expiresIn };

/**
 * Grant authorization codes
 */
server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  const code = utils.createToken({ sub: user.id, exp: config.codeToken.expiresIn });
  db.authorizationCodes.save(user, code, client.id, redirectURI, user.id, client.scope)
    .then(() => done(null, code))
    .catch(err => done(err));
}));

/**
 * Grant implicit authorization.
 */
server.grant(oauth2orize.grant.token((client, user, ares, done) => {
  const token = utils.createToken({ sub: user.id, exp: config.token.expiresIn });
  const expiration = config.token.calculateExpirationDate();
  db.accessTokens.save(token, expiration, user.id, client.id, client.scope)
    .then(() => done(null, token, expiresIn))
    .catch(err => done(err));
}));

/**
 * Exchange authorization codes for access tokens.
 */
server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {

  db.authorizationCodes.delete(code)
    .then(authCode => validate.authCode(code, authCode, client, redirectURI))
    .then(authCode => validate.generateTokens(authCode))
    .then((tokens) => {
      if (tokens.length === 1) {
        return done(null, tokens[0], null, expiresIn);
      }
      if (tokens.length === 2) {
        return done(null, tokens[0], tokens[1], expiresIn);
      }
      throw new Error('Error exchanging auth code for tokens');
    })
    .catch(() => done(null, false));
}));

/**
 * Exchange user id and password for access tokens.
 */
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  db.users.findByUsername(username, password)
    .then(user => validate.generateTokens({ scope, userID: user.id, clientID: client.id }))
    .then((tokens) => {
      if (tokens === false) {
        return done(null, false);
      }
      if (tokens.length === 1) {
        return done(null, tokens[0], null, expiresIn);
      }
      if (tokens.length === 2) {
        return done(null, tokens[0], tokens[1], expiresIn);
      }
      throw new Error('Error exchanging password for tokens');
    })
    .catch(() => done(null, false));
}));

/**
 * Exchange the client id and password/secret for an access token.
 */
server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
  const token = utils.createToken({ sub: client.id, exp: config.token.expiresIn });
  const expiration = config.token.calculateExpirationDate();
  // Pass in a null for user id since there is no user when using this grant type
  db.accessTokens.save(token, expiration, null, client.id, scope)
    .then(() => done(null, token, null, expiresIn))
    .catch(err => done(err));
}));

/**
 * Exchange the refresh token for an access token.
 */
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  db.refreshTokens.find(refreshToken)
    .then(foundRefreshToken => validate.refreshToken(foundRefreshToken, refreshToken, client))
    .then(foundRefreshToken => validate.generateToken(foundRefreshToken))
    .then(token => done(null, token, null, expiresIn))
    .catch(() => done(null, false));
}));

/*
 * User authorization endpoint
 */

exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientID, redirectURI, scope, done) => {
    db.clients.findByClientId(clientID, (error, client) => {
      if (error) return done(error);
      if (client) {
        client.scope = scope;
      }
      return done(null, client, redirectURI);
    });
  }), (req, res, next) => {
    db.clients.findByClientId(req.query.client_id, (error, client) => {
      if (error) res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client })
      if (client != null) {
        server.decision({ loadTransaction: false }, (serverReq, callback) => {
          callback(null, { allow: true });
        })(req, res, next);
      } else {
        res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
      }
    });
  }];

/**
 * User decision endpoint
 */
exports.decision = [
  login.ensureLoggedIn(),
  server.decision(),
];

/**
 * Token endpoint
 */

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];

// Register serialialization and deserialization functions.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
  db.clients.find(id, (error, client) => done(error, client));
});

