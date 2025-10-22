const CustomAPIError=  require("./error")
const {StatusCodes}=require("http-status-codes")
const errorHandler=(err, req, res, next)=>{
    if(err instanceof CustomAPIError){
        return res.status(err.statusCodes).json(err.message)
    }
    if(err.code===11000){
        return res.status(StatusCodes.CONFLICT).json("String already exists in the system")
    }
    res.status(StatusCodes.BAD_REQUEST).json(err.message)
}

module.exports= errorHandler