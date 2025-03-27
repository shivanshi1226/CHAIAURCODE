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
    // Get user details from request body
    const {fullname, email, username, password} = req.body
    console.log(fullname, email, username, password)

    // Validate required fields
  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle avatar file (required)
  if (!req.files?.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatarlocalPath = req.files.avatar[0].path;

  // Handle cover image file (optional)
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  // Upload avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarlocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Upload cover image if provided
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  // Create user in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove sensitive fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new APIResponse(201, createdUser, "User registered successfully"));
})

module.exports = registerUser
