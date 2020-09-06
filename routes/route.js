const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const routeController = require("../controllers/routeContoller");

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", routeController.signup);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  })
);

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.get("/dashboard", routeController.isLoggedIn, (req, res, next) => {
  res.render("dashboard");
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
