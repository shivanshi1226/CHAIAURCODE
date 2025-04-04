const cloudinary = require('cloudinary').v2;
const fs = require("fs")
//Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});
//Uploading
const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath){
            return null
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved file as the upload operation got failed
        return null
    }
}

module.exports = uploadOnCloudinary