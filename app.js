const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require("connect-mongo")(session);
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const router = require("./routes/route");

const app = express();
require("dotenv").config();

app.use(express.static(__dirname + "/public"));

//setting the template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");

//connecting to a database
mongoose.connect(process.env.mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error"));

//making a session
// makes a session in the db when a user visits the website,
// then sends the session id back to browser which is to be stored in the cookie
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db, collection: "sessions" }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, //1day
    },
  })
);

//this will be called when we use the passport.authenticate() function.
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { msg: "Incorrect Username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { msg: "Incorrect password" });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/", router);
app.post("/signup", (req, res, next) => {
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
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  })
);
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
}

app.listen(3000);
