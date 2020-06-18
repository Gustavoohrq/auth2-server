'use strict';


const users = [{
  id: '1',
  username: 'bob',
  password: 'secret',
  name: 'Bob Smith',
}, {
  id: '2',
  username: 'joe',
  password: 'password',
  name: 'Joe Davis',
}];

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.find = id => Promise.resolve(users.find(user => user.id === id));

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */

exports.findByUsername = username =>
  Promise.resolve(users.find(user => user.username === username));
