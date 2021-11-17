const Order = require("../models/orderModal")
const Product = require("../models/productModel");

const ErrorHandler = require("../utils/errorHander");
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require("../utils/apifeatures");



//Create New order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;


    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user : req.user._id,
    })
    res.status(201).json({
        success : true,
        order,
    })
})



////get Single Oder
exports.getSingleOrder = catchAsyncError(async (req, res, next) =>{

    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order){
        return next(new ErrorHandler("Order not found with this Id ", 404))
    }

    res.status(200).json({
        success : true,
        order,
    })
})





//////get Logged in user Oder
exports.myOrders = catchAsyncError(async (req, res, next) =>{

    const orders = await Order.find({user: req.user._id})
    res.status(200).json({
        success : true,
        orders,
    })
})




//get all oders --admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();
  
    let totalAmount = 0;
  
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });



//////update order status ---admin
exports.updateOrder = catchAsyncError(async (req, res, next) =>{

    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this Id ", 404))
    }

    if(order.orderStatus ==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order", 400))
    }

    order.orderItems.forEach(async (o)=>{
        await updateStock(o.product, o.quantity)
    });


    order.orderStatus = req.body.status;
   
    if(req.body.status =="Delivered"){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave : false})
    res.status(200).json({
        success : true,

    })


    
    res.status(200).json({
        success : true,
        totalAmount,
        orders,
    })
})


async function updateStock(id , quantity){
    const product = await Product.findById(id);

    product.Stock= product.Stock-quantity
    await product.save({validateBeforeSave : false})
}





////// delete orders ---admin
exports.deleteOrder = catchAsyncError(async (req, res, next) =>{

    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this Id ", 404))
    }

    await order.remove()
    res.status(200).json({
        success : true,
        
    })
})
