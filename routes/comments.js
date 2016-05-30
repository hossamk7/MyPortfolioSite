var express = require("express");
var router = express.Router({mergeParams: true});
var Picture = require("..models/picture");
var Comment = require("../models/comment");
var authMiddleware = require("../middleware/authMiddleware");

router.post("/pictures/:id/comments", authMiddleware.isLoggedIn, function(req, res) {
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

router.delete("/pictures/:id/comments/:commentId", authMiddleware.checkCommentAuth, function(req, res) {
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

router.put("/pictures/:id/comments/:commentId", authMiddleware.checkCommentAuth, function(req, res){
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

module.exports = router;