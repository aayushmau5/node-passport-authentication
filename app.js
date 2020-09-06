const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo")(session);

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

require("./controllers/passportController");

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/", router);

app.listen(3000);
