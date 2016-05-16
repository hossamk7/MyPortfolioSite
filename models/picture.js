var mongoose = require("mongoose");

var PictureSchema = new mongoose.Schema({
    imageLink: String,
    name: String,
    description: String,
});

module.exports = mongoose.model("Pictures", PictureSchema);