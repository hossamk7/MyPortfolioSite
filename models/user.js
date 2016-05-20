var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = mongoose.Schema({
   username: String,
   password: String,
   email: String
});

UserSchema.plugin(passportLocalMongoose);

var UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;