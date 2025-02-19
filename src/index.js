const dotenv = require("dotenv").config();
const connectDB = require('./config/db'); 
const app = require('./app')

// connectDB().then(()=>{
//     app.on('Error',(error)=>{
//         console.log("error",error)
//         throw error
//     })
//     app.listen(process.env.PORT || 8001, ()=> {
//         console.log(`server is running on ${process.env.PORT}`)
//     })
// }).catch((error)=>{
//     console.log("Mongo db connection failed!!",error)
//     process.exit(1)
// });

//or we can use this also
app.listen(process.env.PORT,async()=>{
    try{
        await connectDB();
        console.log(`server is running on ${process.env.PORT}`)
    } catch(error){
        console.log(`Error connecting to db,${error}`)
        process.exit(1)
    }
})