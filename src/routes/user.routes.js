const express = require("express")
const registerUser = require('../controllers/user.controller')
const userRouter = express.Router()
const upload = require("../middlewares/multer.middleware.js")
userRouter.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
module.exports = userRouter