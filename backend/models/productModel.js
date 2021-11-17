const mongoose = require("mongoose")
// const { type } = require("os")

const productSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product Name"],
        trim : true
    },
    description: {
        type: String,
        required: [true, "Please Enter product Description"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter product Price"],
        maxLength: [8, "Please cannot exceed 8 charcter"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category : {
        type : String,
        required:[true, "Please Enter product category" ]
        
    },

    Stock : {
        type :Number,
        required:[true , "Please Enter product stock"],
        maxLength : [4, "Stock cannot excced 4 charcter"],
        default :1
    },
    numOfReviews : {
        type :Number,
        default: 0
    },
    reviews : [
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref :"User",
                required:true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required: true,
            },
            comment :{
                type : String,
                required:true,
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref :"User",
        required:true,
    },
    createdAt :{
        type:Date,
        default:Date.now
    }


})

module.exports = mongoose.model("Product" ,productSchema)