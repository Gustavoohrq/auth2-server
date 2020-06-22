'use strict';

const clients = [{
  id            : '1',
  name          : 'Lyceum OAuth2.0',
  clientId      : '45f501943e9970a27e32c5f14990d79f',
  clientSecret  : '34114a83504043a492f9e497958e19f9',
}];

/**
 * Returns a client if it finds one, otherwise returns null if a client is not found.
 * @param   {String}   id   - The unique id of the client to find
 * @returns {Promise}  resolved promise with the client if found, otherwise undefined
 */
exports.find = id => Promise.resolve(clients.find(client => client.id === id));

/**
 * Returns a client if it finds one, otherwise returns null if a client is not found.
 * @param   {String}   clientId - The unique client id of the client to find
 * @param   {Function} done     - The client if found, otherwise returns undefined
 * @returns {Promise} resolved promise with the client if found, otherwise undefined
 */
exports.findByClientId = clientId =>
  Promise.resolve(clients.find(client => client.clientId === clientId));
