var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var expressSession = require("express-session");
var connectFlash = require("connect-flash");
var User = require("./models/user");

var pictureRoutes = require("./routes/pictures");
var indexRoutes = require("./routes/index");
var commentRoutes = require("./routes/comments");

//mongoose.connect("mongodb://localhost/my_travel_blog");
mongoose.connect(process.env.DATABASEURL);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/web_pages"));

//PASSPORT CONFIG
app.use(expressSession({
    secret: "the text here is some sort of encoder and decoder SWEET!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy()); //passport-local-mongoose implementation of the Local Strategy

//passport-local-mongoose implementations
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method")); //middleware to override POST method in html to desired http method
app.use(connectFlash());

//set local variables for all views to have.
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.flashRedMessage = req.flash("flashRedMessage");
  res.locals.flashGreenMessage = req.flash("flashGreenMessage");
  res.locals.activeTab = undefined;
  next();
});

app.use(indexRoutes);
app.use(pictureRoutes);
app.use(commentRoutes);

app.get("/*", function(req, res) {
   res.redirect("back"); 
});

app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("----- server started -----");
    console.log(process.env.DATABASEURL);
});