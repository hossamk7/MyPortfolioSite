var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/home", function(req, res) {
   res.redirect("/pictures"); 
});

app.get("/pictures", function(req, res) {
   res.render("pictures.ejs"); 
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