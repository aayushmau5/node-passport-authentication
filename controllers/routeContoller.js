const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.signup = function (req, res, next) {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    user.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
};

exports.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
};
