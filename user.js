'use strict';

const passport = require('passport');

exports.info = [
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    res.json({ user_id: req.user.user});
  },
];
