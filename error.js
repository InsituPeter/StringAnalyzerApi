const {StatusCodes}= require("http-status-codes")

class CustomAPIError extends Error{
    constructor(message, statusCodes= StatusCodes.INTERNAL_SERVER_ERROR){
        super(message)
        this.statusCodes= statusCodes
    }  }


    module.exports= CustomAPIError