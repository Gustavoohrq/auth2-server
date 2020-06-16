'use strict';

const passport = require('passport');
const login = require('connect-ensure-login');

module.exports.index = (request, response) => response.send('OAuth 2.0 Server');

module.exports.loginForm = (request, response) => response.render('login');

module.exports.login = passport.authenticate('local', { successReturnToOrRedirect: 'https://skills-store.amazon.com.br/external/link-result?success=true&languageCode=pt_BR&skillId=amzn1.ask.skill.b42b939f-0073-45ca-99b6-055fdab00aff&skillStage=development', failureRedirect: '/login' });

module.exports.logout = (request, response) => {
  request.logout();
  response.redirect('/');
};

module.exports.account = [
  login.ensureLoggedIn(),
  (request, response) => response.render('account', { user: request.user }),
];
