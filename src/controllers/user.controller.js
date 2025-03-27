const asyncHandler = require('../utils/asyncHandler')
const ApiError = require("../utils/APIError.js")
const User = require("../models/User.model.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const APIResponse = require("../utils/APIResponse.js")
const registerUser = asyncHandler(async (req,res,next) => {
    //get user details from backend
    //validation - not empty
    //check if user already exists:username,email
    //check for images, check for avatar
    //if images and avatar available,upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response
    const {fullname,email,username,password} = req.body
    console.log("email :",email);

    // if(fullname===""){     //can check all like this as well
    //     throw new ApiError(400,"Full name is required")
    // }


    //// Using `some` lets us check all fields in one go, instead of repeating the same check for each one.
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    //multer gives acces to req.files
    const avatarlocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.avatar[0]?.path
    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarlocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(
        new APIResponse(200,createdUser,"User registered successfully")
    )
})

module.exports = registerUser
