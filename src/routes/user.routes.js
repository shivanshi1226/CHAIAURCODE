const express = require("express");
const {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken
} = require("../controllers/user.controller");
const verifyJWT = require("../middlewares/auth.middlewares")
const userRouter = express.Router();
const upload = require("../middlewares/multer.middleware");

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser)
//secure routes
userRouter.route("/logout").post(verifyJWT,logOutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

module.exports = userRouter;
