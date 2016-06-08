var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var passport = require("passport");

router.get("/", function(req, res){
    res.render("landing.ejs");
});

router.get("/signup", function(req, res) {
   res.render("signup.ejs"); 
});

router.post("/signup", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("signup.ejs", {flashRedMessage: err.message });
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("flashGreenMessage", "Hello " + user.username);
            res.redirect("/pictures/recent");
        });
    });
});

router.post('/login', function(req, res, next){
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


router.get("/logout", function(req, res){
    req.logout();
    req.flash("flashGreenMessage", "You have been logged out.");
    res.redirect("/pictures/recent");
});

module.exports = router;