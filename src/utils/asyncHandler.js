const asyncHandler = (fn) => async(req,res,next) => {
    try{
        await fn(req,res,next)
    }catch(error){
        res.error(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = asyncHandler


// const asyncHandler = (fn) => { //second method
//     (req,res,next)=> {
//         Promise.resolve(fn(req,res,next)).
//         catch((err)=>next(err))
//     }
// }