var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var expressSession = require("express-session");
var connectFlash = require("connect-flash");

mongoose.connect("mongodb://localhost/my_travel_blog");
app.use(bodyParser.urlencoded({extended: true})); 

app.use(express.static(__dirname + "/public"));
var authMiddleware = require("./middleware/authMiddleware");

var User = require("./models/user");
var Picture = require("./models/picture");
var Comment = require("./models/comment");

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

var pictureRoutes = require("./routes/pictures");
app.use(pictureRoutes);

// ==========================  ROUTES BEGIN  ==============================

app.get("/pictures", function(req, res){
    res.render("landing.ejs");
});

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
            return res.render("signup.ejs", {flashRedMessage: err.message });
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("flashGreenMessage", "Hello " + user.username);
            res.redirect("/pictures/recent");
        });
    });
});

app.post('/login', function(req, res, next){
    passport.authenticate("local", function(err, user, info){
        if(err){
            return next(err);
        }
        if (user === false){
            console.log(info);
            req.flash("flashRedMessage", info.message);
            return res.redirect("back");
        }
        req.login(user, function(err){
            if(err){
                return next(err);
            }
            req.flash("flashGreenMessage", "Welcome back " + user.username + "!");
            return res.redirect("/pictures/recent");        
        });      
    })(req, res);
});


app.get("/logout", function(req, res){
    req.logout();
    req.flash("flashGreenMessage", "You have been logged out.");
    res.redirect("/pictures/recent");
});





// ================ COMMENTS ROUTES =======================

app.post("/pictures/:id/comments", authMiddleware.isLoggedIn, function(req, res) {
    var author = { id: req.user.id, username: req.user.username };
    var newComment = { text: req.body.text, author: author };
    
    Picture.findById(req.params.id, function(err, picture) {
        if(err){
            req.flash("flashRedMessage", "failed to add comment");
            res.redirect("back");
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

app.delete("/pictures/:id/comments/:commentId", authMiddleware.checkCommentAuth, function(req, res) {
    Picture.findById(req.params.id, function(err, picture) {
        if(err){
            req.flash("flashRedMessage", "failed to delete comment");
            res.redirect("back");
        }
        Comment.findByIdAndRemove(req.params.commentId, function(err){
            console.log("deleted comment: " + req.params.commentId);
            if(err){
                console.log("delete error" + err);
            } else {
                picture.comments.pull({_id: req.params.commentId});
                picture.save();
                res.redirect("/pictures/" + req.params.id);
            }
        });
    });
});

app.put("/pictures/:id/comments/:commentId", authMiddleware.checkCommentAuth, function(req, res){
    var comment = {text: req.body.commentText, author: {id: req.user.id, username: req.user.username} };
    Comment.findByIdAndUpdate(req.params.commentId, comment, function(err, editedComment){
       if(err){
           console.log("err");
       } else {
           console.log(editedComment);
           res.redirect("/pictures/" + req.params.id);
       }
    });
});

app.get("/*", function(req, res) {
   res.redirect("back"); 
});

app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("----- server started -----");
});