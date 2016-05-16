var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/my_travel_blog");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

var Pictures = require("./models/picture.js");

app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/home", function(req, res) {
   res.redirect("/pictures"); 
});

app.get("/pictures", function(req, res) {
   Pictures.find({}, function(err, pictures){
       if(err){
           console.log(err);
       }else {
           console.log(pictures[0].name);
           res.render("pictures.ejs", {pictures: pictures});
       }   
    });
});

app.get("/pictures/new", function(req, res) {
   res.render("addNewPicture.ejs"); 
});

app.post("/pictures", function(req, res){
    var newPicture = {name: req.body.name, imageLink: req.body.imageLink, description: req.body.description};
    console.log(newPicture);
    Pictures.create(newPicture, function(err, addedPicture){
        if(err){
            console.log("error" + err);
        } else {
            console.log(addedPicture);
            res.redirect("/pictures");
        }
    });
});

app.get("/pictures/:id", function(req, res) {
   res.render("show.ejs");
});

app.get("/pictures/:id/comments/new", function(req, res) {
   //new comments form 
   res.render("comments/new.ejs");
});

app.post("/pictures/:id/comments", function(req, res){
    //user authentication
    //validation 
    //add comments to the database and redirect to show page.
});

app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("----- server started -----");
});