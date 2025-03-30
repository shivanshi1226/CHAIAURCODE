const ApiError = require("../utils/APIError.js")
const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler.js")
const User = require("../models/User.model.js")
const verifyJWT = asyncHandler(async(req,res,next)=>{
    try{
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer","")
    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        //some discussion here
        throw new ApiError(401,"Invalid Access Token")
    }
    req.user = user;
    next()
   }catch(error){
    throw new ApiError(401,error?.message||"Invalid access token")
   }
})
module.exports = verifyJWT