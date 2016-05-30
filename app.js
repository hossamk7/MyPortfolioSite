var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var expressSession = require("express-session");
var connectFlash = require("connect-flash");
var path = require("path");
var fs = require("fs");

mongoose.connect("mongodb://localhost/my_travel_blog");
app.use(bodyParser.urlencoded({extended: true})); 

app.use(express.static(__dirname + "/public"));
var upload = require("./middleware/fileUploadMulter.js");
var authMiddleware = require("./middleware/authMiddleware.js");

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

//get all pictures from the database and send to pictures view.
app.get("/pictures/all", function(req, res) {
   Picture.find({}, function(err, pictures){
       if(err){
           console.log(err);
       }else {
           res.render("pictures.ejs", {pictures: pictures, activeTab: "show all"});
       }   
    });
});

app.get("/pictures/recent", function(req, res) {
    Picture.find().sort({"created": -1}).limit(8).exec(function(err, pictures){
        if(err){
            req.flash("flashRedMessage", "Unable to get pictures");
            res.redirect("/pictures/recent");
            console.log(err);
        } else {
            res.render("pictures.ejs", {pictures: pictures, activeTab: "recently added"});
        }
    });
});

//render the new picture form
app.get("/pictures/new", authMiddleware.isLoggedIn, function(req, res) {
   res.render("new.ejs");
});


//add new pic
app.post("/pictures", authMiddleware.isLoggedIn, upload.single('upload'), function(req, res){
    if(req.file){
        var fileExt = path.extname(req.file.originalname);
        var fileName = req.file.filename + fileExt;
        fs.renameSync(req.file.path, "public/images/" + fileName);
        var imageLink = "/images/" + fileName;
        var newPicture = { name: req.body.name, imageLink: imageLink, description: req.body.description, author: {id: req.user.id, username: req.user.username} };
        console.log(newPicture);
        Picture.create(newPicture, function(err, addedPicture){
            if(err){
                console.log("error" + err);
            } else {
                res.redirect("/pictures/recent");
            }
        });
    } else {
        req.flash("flashRedMessage", "Upload Failed: Files must be images of type (.jpg / .png / .gif) and no larger than 5mb.");
        res.redirect("/pictures/new");
    }
});


app.get("/pictures/random", function(req, res){
    Picture.find({}).populate("comments").exec(function(err, pictures){
        if(err){
            console.log(err); 
        }else {
            var random = Math.floor(Math.random() * pictures.length);
            var picture = pictures[random];
            console.log(picture);
            res.render("show.ejs", {picture: picture, isRandom: true});
        } 
    });
});

//show a single pic in full view
app.get("/pictures/:id", function(req, res) {
    Picture.findById(req.params.id).populate("comments").exec(function(err, picture){
        if(err){
            console.log(err);
        } else {
            res.render("show.ejs", {picture: picture, isRandom: false});
        }
    });
});

//render edit page
app.get("/pictures/:id/edit", authMiddleware.checkPictureAuth, function(req, res){
    Picture.findById(req.params.id, function(err, pic){
       if(err){
           console.log("error " + err);
       } else {
           res.render("edit.ejs", {picture: pic});
       }
    });
});

//edit the picture
app.put("/pictures/:id/edit", authMiddleware.checkPictureAuth, function(req, res){
    console.log(req.params.id);  
    Picture.findByIdAndUpdate(req.params.id, req.body.picture, function(err, picture) {
      if(err){
          console.log("error" + err);
      } else {
          req.flash("flashGreenMessage", "Successfully edited " + picture.name);
          res.redirect("/pictures/" + picture.id); //redirect to show the updated picture
      }
   }); 
});



//delete a picture
app.delete("/pictures/:id", authMiddleware.checkPictureAuth, function(req, res) {
   Picture.findByIdAndRemove(req.params.id, function(err, picture){
       if(err){
           console.log("couldn't delete picture");
       } else {
            fs.unlink("public" + picture.imageLink, function(err){
                if(err){
                    console.log("err");
                }
            });
            req.flash("flashGreenMessage", "Picture deleted");
            res.redirect("/pictures/recent");
       }
   });
});

app.get("/pictures/find/:username", function(req, res) {
    Picture.find({"author.username": req.params.username}, function(err, pictures) {
        if(err){
            console.log("err" + err);
        } else {
            res.render("pictures.ejs", {pictures: pictures, flashGreenMessage: "Showing pictures added by " + req.params.username });
        }
    });
});



// ================ COMMENTS ROUTES =======================

app.post("/pictures/:id/comments", authMiddleware.isLoggedIn, function(req, res) {
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

app.delete("/pictures/:id/comments/:commentId", authMiddleware.checkCommentAuth, function(req, res) {
    
    Picture.findById(req.params.id, function(err, picture) {
        if(err){
            
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