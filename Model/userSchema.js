const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    Name:{type:String},
    email:{type:String, required:true,unique:true},
    password:{type:String,required:true,},
    Address:{type:String},
    token:{type:String},
    oldPassword:{type:String},
    newPassword:{type:String},
    otp:{type:String}
})
module.exports = mongoose.model("snabbUser",userSchema);