'use strict';

const oauth2orize = require('@poziworld/oauth2orize');
const passport = require('passport');
const login = require('connect-ensure-login');
const db = require('../db');
const utils = require('../utils');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

// Register serialization and deserialization functions.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
  db.clients.findById(id, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
});

function issueTokens(userId, clientId, done) {
  db.users.findById(userId, (error, user) => {
    const accessToken = utils.getUid(250);
    const refreshToken = utils.getUid(250);
    db.accessTokens.save(accessToken, userId, clientId, (error) => {
      if (error) return done(error);
      db.refreshTokens.save(refreshToken, userId, clientId, (error) => {
        if (error) return done(error);
        return done(null, accessToken, refreshToken);
      });
    });
  });
}

// Register supported grant types.

server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
  const code = utils.getUid(16);
  db.authorizationCodes.save(code, client.id, redirectUri, user.codPessoa, user.nomeAluno, (error) => {
    if (error) return done(error);
    return done(null, code);
  });
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
  issueTokens(user.codPessoa, client.clientId, done);
}));

// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code. The issued access token response can include a refresh token and
// custom parameters by adding these to the `done()` call

server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
  db.authorizationCodes.find(code, (error, authCode) => {
    if (error) return done(error);
    if (client.id !== authCode.clientId) return done(null, false);
    if (redirectUri !== authCode.redirectUri) return done(null, false);

    issueTokens(authCode.userId, client.clientId, done);
  });
}));

// Exchange user id and password for access tokens. The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  // Validate the client
  db.clients.findByClientId(client.clientId, (error, localClient) => {
    if (error) return done(error);
    if (!localClient) return done(null, false);
    if (localClient.clientSecret !== client.clientSecret) return done(null, false);
    // Validate the user
    db.users.findByUsername(username, (error, user) => {
      if (error) return done(error);
      if (!user) return done(null, false);
      if (password !== user.password) return done(null, false);
      // Everything validated, return the token
      issueTokens(user.codPessoa, client.clientId, done);
    });
  });
}));

// Exchange the client id and password/secret for an access token. The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
  // Validate the client
  db.clients.findByClientId(client.clientId, (error, localClient) => {
    if (error) return done(error);
    if (!localClient) return done(null, false);
    if (localClient.clientSecret !== client.clientSecret) return done(null, false);
    // Everything validated, return the token
    // Pass in a null for user id since there is no user with this grant type
    issueTokens(null, client.clientId, done);
  });
}));

// issue new tokens and remove the old ones
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  db.refreshTokens.find(refreshToken, (error, token) => {
    if (error) return done(error);
    issueTokens(token.id, client.id, (err, accessToken, refreshToken) => {
      if (err) {
        done(err, null, null);
      }
      db.accessTokens.removeByUserIdAndClientId(token.userId, token.clientId, (err) => {
        if (err) {
          done(err, null, null);
        }
        db.refreshTokens.removeByUserIdAndClientId(token.userId, token.clientId, (err) => {
          if (err) {
            done(err, null, null);
          }
          done(null, accessToken, refreshToken);
        });
      });
    });
  });
}));

// User authorization endpoint.

module.exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientId, redirectUri, done) => {
    db.clients.findByClientId(clientId, (error, client) => {
      if (error) return done(error);
      return done(null, client, redirectUri);
    });
  }, (client, user, done) => {
    if (client.isTrusted) return done(null, true);

    db.accessTokens.findByUserIdAndClientId(user.codPessoa, client.clientId, (error, token) => {
      // Auto-approve
      if (token) return done(null, true);

      // Otherwise ask user
      return done(null, false);
    });
  }),
  (request, response) => {
    response.render('dialog', { transactionId: request.oauth2.transactionID, user: request.user, client: request.oauth2.client });
  },
];

// User decision endpoint.
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application. Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

module.exports.decision = [
  login.ensureLoggedIn(),
  server.decision(),
];


// Token endpoint.
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.

module.exports.token = [

  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];
