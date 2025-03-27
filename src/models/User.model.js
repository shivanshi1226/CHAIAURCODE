const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken") //jwt is a bearer token
const Video = require("./Video.model")
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true // to enable searching field
    }, 
    email: {
        type: String,
        required: true,
        unique : true,
        lowercase : true,
        trim : true,
    }, 
    fullname : {
        type: String,
        required : true,
        trim : true,
        index : true
    }, 
    avatar : {
        type: String,  //cloudinary url
        required: true,
    }, 
    coverImage : {
        type: String, //cloudinary url
    }, 
    watchHistory : [
    {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Video",
    } 
    ],
    password : {
        type: String,
        required: [true,'Password is required']
    }, 
    refreshToken : {
        type: String
    }
},{
    timestamps: true,
})
userSchema.pre("save",async function(err,req,res,next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password,2)
    next();
})
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.accessToken = async function (){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generaterefreshToken = async function (){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model('User',userSchema)
module.exports = User