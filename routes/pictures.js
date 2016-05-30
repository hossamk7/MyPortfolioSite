var express = require("express");
var router = express.Router({mergeParams: true});
var fs = require("fs");
var path = require("path");
var Picture = require("../models/picture");
var authMiddleware = require("../middleware/authMiddleware");
var upload = require("../middleware/fileUploadMulter");


//get all pictures from the database and send to pictures view.
router.get("/pictures/all", function(req, res) {
   Picture.find({}, function(err, pictures){
       if(err){
           res.redirect("/");
       }else {
           res.render("pictures.ejs", {pictures: pictures, activeTab: "show all"});
       }   
    });
});

router.get("/pictures/recent", function(req, res) {
    Picture.find().sort({"created": -1}).limit(8).exec(function(err, pictures){
        if(err){
            req.flash("flashRedMessage", "Unable to get pictures");
            res.redirect("/pictures/recent");
        } else {
            res.render("pictures.ejs", {pictures: pictures, activeTab: "recently added"});
        }
    });
});

//render the new picture form
router.get("/pictures/new", authMiddleware.isLoggedIn, function(req, res) {
   res.render("new.ejs");
});


//add new pic
router.post("/pictures", authMiddleware.isLoggedIn, upload.single('upload'), function(req, res){
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


router.get("/pictures/random", function(req, res){
    Picture.find({}).populate("comments").exec(function(err, pictures){
        if(err){
            console.log(err); 
        }else {
            var random = Math.floor(Math.random() * pictures.length);
            var picture = pictures[random];
            console.log(picture);
            res.redirect("/pictures/" + picture.id);
        } 
    });
});

//show a single pic in full view
router.get("/pictures/:id", function(req, res) {
    Picture.findById(req.params.id).populate("comments").exec(function(err, picture){
        if(err){
            req.flash("flashRedMessage", "error, failed to find picture");
            res.redirect("pictures/recent");
        } else {
            res.render("show.ejs", {picture: picture});
        }
    });
});

//render edit page
router.get("/pictures/:id/edit", authMiddleware.checkPictureAuth, function(req, res){
    Picture.findById(req.params.id, function(err, pic){
       if(err){
           req.flash("flashRedMessage", "error: couldn't get the edit page");
           res.redirect("/pictures/" + req.params.id);
       } else {
           res.render("edit.ejs", {picture: pic});
       }
    });
});

//edit the picture
router.put("/pictures/:id/edit", authMiddleware.checkPictureAuth, function(req, res){
    console.log(req.params.id);  
    Picture.findByIdAndUpdate(req.params.id, req.body.picture, function(err, picture) {
      if(err){
          req.flash("flashRedMessage", "error: couldn't edit this post");
          res.redirect("/pictures/" + req.params.id);
      } else {
          req.flash("flashGreenMessage", "Successfully edited " + picture.name);
          res.redirect("/pictures/" + picture.id); //redirect to show the updated picture
      }
   }); 
});



//delete a picture
router.delete("/pictures/:id", authMiddleware.checkPictureAuth, function(req, res) {
   Picture.findByIdAndRemove(req.params.id, function(err, picture){
       if(err){
           req.flash("flashRedMessage", "error: couldn't delete picture");
           res.redirect("/pictures/" + req.params.id);
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

router.get("/pictures/find/:username", function(req, res) {
    Picture.find({"author.username": req.params.username}, function(err, pictures) {
        if(err){
            req.flash("flashRedMessage", "error: failed to find pictures from this user");
            res.redirect("/pictures/" + req.params.id);
        } else {
            res.render("pictures.ejs", {pictures: pictures, flashGreenMessage: "Showing pictures added by " + req.params.username });
        }
    });
});

module.exports = router;