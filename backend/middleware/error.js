const errorHandler = require("errorhandler");
const ErrorHandler = require("../utils/errorHander")


module.exports = (err ,req ,res, next) =>{

    err.statusCode = err.statusCode || 500 ;
    err.message = err.message || "Internal Server Error"


    //wrong MongoDb Id error
    if(err.name === "CastError"){
        const message = `Resource not Found. Invalid : ${err.path}`
        err = new ErrorHandler(message , 400)
    }


    //Mongoose duplocate key error
    if(err.code ==11000 ){
        const message = `Duplicate  ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message , 400)

    }


     //Wrong JWT token
     if(err.name == "JsonWebTokenError" ){
        const message = `Json web token is envalid, Please try again`
        err = new ErrorHandler(message , 400)

    }



    //JWT expire error
    if(err.name == "TokenExpireError" ){
        const message = `Json web token is expire, Please try again`
        err = new ErrorHandler(message , 400)

    }


    res.status(err.statusCode).json({
        success : false,
        message : err.message,
    })
}