'use strict';

const jwt = require('jsonwebtoken');

let codes = Object.create(null);


exports.find = (token) => {
  try {
    const id = jwt.decode(token).jti;
    return Promise.resolve(codes[id]);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Saves a authorization code, client id, redirect uri, user id, and scope. Note: The actual full
 * authorization token is never saved.  Instead just the ID of the token is saved.  In case of a
 * database breach this prevents anyone from stealing the live tokens.
 * @param   {String}  code        - The authorization code (required)
 * @param   {String}  clientID    - The client ID (required)
 * @param   {String}  redirectURI - The redirect URI of where to send access tokens once exchanged
 * @param   {String}  userID      - The user ID (required)
 * @param   {String}  scope       - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (user, code, clientID, redirectURI, userID, scope) => {
  const id = jwt.decode(code).jti;
  codes[id] = { user, clientID, redirectURI, userID, scope };
  return Promise.resolve(codes[id]);
};

/**
 * Deletes an authorization code
 * @param   {String}  token - The authorization code to delete
 * @returns {Promise} resolved with the deleted value
 */
exports.delete = (token) => {
  try {
    const id = jwt.decode(token).jti;
    const deletedToken = codes[id];
    delete codes[id];
    return Promise.resolve(deletedToken);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

exports.removeAll = () => {
  const deletedTokens = codes;
  codes = Object.create(null);
  return Promise.resolve(deletedTokens);
};
