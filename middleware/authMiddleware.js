var Comment = require("../models/comment.js");
var Picture = require("../models/picture.js");
var authFunctions = {};

// ============= auth functions ===============

authFunctions.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("flashRedMessage", "You must be logged in to perform this action.");
    res.redirect("back");
};

authFunctions.checkPictureAuth = function(req, res, next){
    if(req.isAuthenticated()){
        Picture.findById(req.params.id, function(err, picture) {
            console.log(picture);
            if(err){
                req.flash("flashRedMessage", "Unable to find picture");
                res.redirect("back");
            } else if(picture.author.id.equals(req.user.id)){
                return next();
            } else {
                req.flash("flashRedMessage", "You do not have permission to perform this action.");
                res.redirect("back");
            }
        });
    } else {
        req.flash("flashRedMessage", "You must be logged in to perform this action.");
        res.redirect("back");
    }
};

authFunctions.checkCommentAuth = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentId, function(err, comment) {
            if(err){
                req.flash("flashRedMessage", "Unable to find comment");
                res.redirect("back");
            } else if(comment.author.id.equals(req.user.id)){
                return next();
            } else {
                req.flash("flashRedMessage", "You do not have permission to perform this action.");
                res.redirect("back");
            }
        });
    } else {
        req.flash("flashRedMessage", "You must be logged in to perform this action.");
        res.redirect("back");
    }
};

module.exports = authFunctions;