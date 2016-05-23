var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
   username: String,
   password: String,
   email: String
});

userSchema.plugin(passportLocalMongoose);

var userModel = mongoose.model("User", userSchema);

module.exports = userModel;