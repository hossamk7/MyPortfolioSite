var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    created: { type: Date, default: Date.now },
    author: 
    {
        id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
        username: String
    }
});

var commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;