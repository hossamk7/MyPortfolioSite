var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
//var LocalStrategy = require("passport-local");
var expressSession = require("express-session");

mongoose.connect("mongodb://localhost/my_travel_blog");
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/public"));

var User = require("./models/user");
var Picture = require("./models/picture.js");
var Comment = require("./models/comment.js");

//PASSPORT CONFIG
app.use(expressSession({
    secret: "the text here is some sort of encoder and decoder",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy()); //passport-local-mongoose implementation of the Local Strategy

//passport-local-mongoose implementations
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method")); //override post in html to desired http method

//set local variables for all views to have.
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// ============= auth methods ===============

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } 
    res.redirect("back");
}

function checkPictureAuth(req, res, next){
    if(req.isAuthenticated()){
        Picture.findById(req.params.id, function(err, picture) {
            if(err){
                console.log("error" + err);
                res.redirect("back");
            } else if(picture.author.id.equals(req.user.id)){
                return next();
            } else {
                res.redirect("back");
            }
        });
    }
}

// ==========================  ROUTES BEGIN  ==============================

app.get("/", function(req, res){
    res.render("landing.ejs");
});

//Registration page
app.get("/signup", function(req, res) {
   res.render("signup.ejs"); 
});

app.post("/signup", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signup.ejs");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/pictures");
        });
    });
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/pictures",
        failureRedirect: "back"
    }
    ), function(req, res){
    });

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/pictures");
});

//get all pictures from the database and send to pictures view.
app.get("/pictures", function(req, res) {
   Picture.find({}, function(err, pictures){
       if(err){
           console.log(err);
       }else {
           res.render("pictures.ejs", {pictures: pictures});
       }   
    });
});

//render the new picture form
app.get("/pictures/new", isLoggedIn, function(req, res) {
   res.render("new.ejs");
});

//add new pic
app.post("/pictures", isLoggedIn, function(req, res){
    var newPicture = {name: req.body.name, imageLink: req.body.imageLink, description: req.body.description};
    console.log(newPicture);
    Picture.create(newPicture, function(err, addedPicture){
        if(err){
            console.log("error" + err);
        } else {
            console.log(addedPicture);
            res.redirect("/pictures");
        }
    });
});

//show a single pic in full view
app.get("/pictures/:id", function(req, res) {
    Picture.findById(req.params.id).populate("comments").exec(function(err, picture){
        if(err){
            console.log(err);
        } else {
            res.render("show.ejs", {picture: picture});
        }
    });
});

//render edit page
app.get("/pictures/:id/edit", function(req, res){
    Picture.findById(req.params.id, function(err, pic){
       if(err){
           console.log("error " + err);
       } else {
           res.render("edit.ejs", {picture: pic});
       }
    });
});

//edit the picture
app.put("/pictures/:id/edit", function(req, res){
    console.log(req.params.id);  
    Picture.findByIdAndUpdate(req.params.id, req.body.picture, function(err, picture) {
      if(err){
          console.log(req.body.picture);
          console.log("error" + err);
      } else {
          console.log(picture);
          res.redirect("/pictures/" + picture.id); //redirect to show the updated picture
      }
   }); 
});

//delete a picture
app.delete("/pictures/:id", function(req, res) {
   Picture.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log("couldn't delete picture");
       } else {
           res.redirect("/pictures");
       }
   });
});


// ================ COMMENTS ROUTES =======================

app.post("/pictures/:id/comments", isLoggedIn, function(req, res) {
    var author = { id: req.user.id, username: req.user.username };
    var newComment = { text: req.body.text, author: author };
    
    Picture.findById(req.params.id, function(err, picture) {
        if(err){
            
        } 
        else {
            Comment.create(newComment, function(err, addedComment){
                if(err){
                    console.log(err);
                } else {
                    picture.comments.push(addedComment);
                    picture.save();
                    console.log(addedComment);
                    res.redirect("/pictures/" + req.params.id);
                }
            });
        }
    });
});

app.delete("/pictures/:id/comments/:commentId", function(req, res) {
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        console.log(req.params.commentId);
        if(err){
            console.log("delete error" + err);
        } else {
            res.redirect("/pictures/" + req.params.id);
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("----- server started -----");
});