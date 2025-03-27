const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express();
const userRouter = require('./routes/user.routes.js')
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({
    limit: "16kb",
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

//routes
app.use("/api/v1/users",userRouter)
//https://localhost:8000/api/v1/users/register
module.exports = app;


