const asyncHandler = require('../utils/asyncHandler')
const ApiError = require("../utils/APIError.js")
const User = require("../models/User.model.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const APIResponse = require("../utils/APIResponse.js")
const jwt = require("jsonwebtoken")
const { options } = require('../routes/user.routes.js')
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generaterefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false }) //refreshToken is saved in database at this step
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(501, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details from backend
  //validation - not empty
  //check if user already exists:username,email
  //check for images, check for avatar
  //if images and avatar available,upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response
  // Get user details from request body
  const { fullname, email, username, password } = req.body
  console.log(fullname, email, username, password)

  // Validate required fields
  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required")
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  // Handle avatar file (required)
  if (!req.files?.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar file is required")
  }
  const avatarlocalPath = req.files.avatar[0].path

  // Handle cover image file (optional)
  let coverImageLocalPath
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarlocalPath)
  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed")
  }

  // Upload cover image if provided
  let coverImage
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath)
  }

  // Create user in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  })

  // Remove sensitive fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res
    .status(201)
    .json(new APIResponse(201, createdUser, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
  //get data from req body
  //username or email based login
  //find the user if there
  //password check
  //access and refresh token 
  //send cookies
  //write yes now successfully login
  const { email, username, password } = req.body
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (!user) {
    throw new ApiError(404, "User does not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const loggedUser = await User.findById(user._id).select("-password -refreshToken") // ✅ Fixed

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // ✅ Fixed
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        {
          user: loggedUser, accessToken, refreshToken
        },
        "User logged in Successfully"
      )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1 //this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .clearCookie("accessToken", options) // ✅ Fixed
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new APIResponse(
      200, {}, "User Logged Out successfully"
    ))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomigRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomigRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  } 
  try{
  const decodedToken = jwt.verify(incomigRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401,"Invalid Refresh Token")
  } 
  if(incomigRefreshToken!==user?.refreshToken){
    throw new ApiError(401,"Refresh token is expired or used")
  }
  const option = {
    httpOnly:true,
    secure:true
  }
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  return res.status(200)
  .cookie("accessToken",accessToken,options).
  cookie("refreshToken",newRefreshToken,options).
  json(new APIResponse(
    200,
    {accessToken,refreshToken:newRefreshToken},
    "Access token refreshed successfully"
  ))
}catch(error){
  throw new ApiError(401,error?.message||"Invalid refresh Token")
}
})
module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken
}
