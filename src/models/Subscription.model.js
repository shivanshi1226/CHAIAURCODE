const mongoose = require("mongoose")
const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, //One who is subscribing
        ref: "User"
    },
    cahnnel:{
        type: mongoose.Schema.Types.ObjectId, //One to whom subscriber is subscribing
        ref: "User"
    }
},{
    timestamps:true
})
const Subscription = mongoose.Model("Subscription",subscriptionSchema)
module.exports = Subscription