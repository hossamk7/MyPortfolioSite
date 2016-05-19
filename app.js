var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

mongoose.connect("mongodb://localhost/my_travel_blog");
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); //override post in html to desired http method

var Picture = require("./models/picture.js");

app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/home", function(req, res) {
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
app.get("/pictures/new", function(req, res) {
   res.render("new.ejs"); 
});

app.post("/pictures", function(req, res){
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

app.get("/pictures/:id", function(req, res) {
    Picture.findById(req.params.id, function(err, picture){
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

app.get("/pictures/:id/comments/new", function(req, res) {
   //new comments form 
   res.render("comments/new.ejs");
});

app.post("/pictures/:id", function(req, res){
    //user authentication
    //validation 
    //add comments to the database and redirect to show page.
});

app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("----- server started -----");
});