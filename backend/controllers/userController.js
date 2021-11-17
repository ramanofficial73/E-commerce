const ErrorHandler = require("../utils/errorHander");
const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const errorHandler = require("errorhandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require('crypto')
const cloudinary = require("cloudinary")


//register a user
exports.registerUser = catchAsyncError (async(req ,res ,next)=>{

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder : "avatars",
        width: 150,
        crop : "scale",
    })

    const {name, email,password}  = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id : myCloud.public_id,
            url :myCloud.secure_url,
        }
    })

    sendToken(user, 201, res)
    
})



//Login User
exports.loginUser = catchAsyncError (async (req, res, next)=>{

    const {email, password} = req.body;

    //checking if user has password and email both
    if(!email || !password){
        return next(new  ErrorHandler("Please Enter email and Password", 400))
    }

    const user =await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    const isPasswordMatched =await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    sendToken(user, 200, res)

    

})




//Logout User

exports.logout = catchAsyncError(async(req, res, next)=>{

    res.cookie("token", null,{
        expires : new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success : true,
        message : "Logout successful"
    })
})




//Forget Password

exports.forgotPassword = catchAsyncError(async(req, res , next)=>{
    const user = await User.findOne({email : req.body.email})
    
    if(!user){
        return next(new ErrorHandler("User not Found", 404))
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeForeSave:  false})

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n  ${resetPasswordUrl}\n\n if you hav not requested this email then ,please igonre it`

    try{
        await sendEmail({
            email: user.email,
            subject : `Ecoomerce password Recovery`,
            message,
        })
        res.status(200).json({
            success : true,
            message : `Email sent to ${user.email} successfully`,
        })

    } catch (error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeForeSave:  false})

        return next(new ErrorHandler(error.message, 500))
    }
})


//reset password
exports.resetPassword = catchAsyncError(async(req, res , next)=>{

    //creating a token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt : Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset password token is  Invalid or has been expired", 400))
    }

    if(req.body.password !==req.body.confirmPassword){
        return next(new ErrorHandler ("Password does not match" , 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;


    await user.save()
    sendToken(user , 200, res)
})



// getUserDeatils
exports.getUserDetails = catchAsyncError(async(req ,res , next)=>{

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success : true,
        user
    })
})




//update user password
exports.updatePassword = catchAsyncError(async(req ,res , next)=>{

const user = await User.findById(req.user.id).select("+password")

const isPasswordMatched =await user.comparePassword(req.body.oldPassword);

if(!isPasswordMatched){
    return next(new ErrorHandler("old password is Incorrect", 400))
}

if(req.body.newPassword !==req.body.confirmPassword){
    return next(new ErrorHandler("Password does matched", 400))

}

user.password = req.body.newPassword;
await user.save()

sendToken(user , 200 , res)
})





//update   profile

exports.updateProfile = catchAsyncError(async(req ,res , next)=>{

    const newUserData = {
        name : req.body.name,
        email: req.body.email
    }

if(req.body.avatar !== ""){
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId)
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder : "avatars",
        width: 150,
        crop : "scale",
    })
    newUserData.avatar = {
        public_id : myCloud.public_id,
            url :myCloud.secure_url,
    }

}

    const user  =await User.findByIdAndUpdate(req.user.id , newUserData, {
        new : true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
    
    sendToken(user , 200 , res)
    })





    //get all users (admin)

    exports.getAllUser = catchAsyncError(async(req ,res , next)=>{
        const users = await User.find()
        res.status(200).json({
            success: true,
            users
        })
    })




//get single user (admin)

exports.getSingleUser = catchAsyncError(async(req ,res , next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exits with Id : ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})






//update user role ---admin
exports.updateUserRole = catchAsyncError(async(req ,res , next)=>{

    const newUserData = {
        name : req.body.name,
        email: req.body.email,
        role :req.body.role
    }

    const user  =await User.findByIdAndUpdate(req.params.id , newUserData, {
        new : true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
    
    sendToken(user , 200 , res)
    })






    
//Delete user  ---admin
exports.deleteUser = catchAsyncError(async(req ,res , next)=>{

    const user = await User.findById(req.params.id);


    //we will add cloudunary
if(!user){
    return next(new ErrorHandler(`user does not exits with id :${req.params.id}`))
}

await user.remove();

    res.status(200).json({
        success: true,
        message :"User Deleted Successfuuly"
    })
})


