const Product = require("../models/productModel");
const mongoose = require('mongoose')
// import mongoose from 'mongoose';
const ErrorHandler = require("../utils/errorHander");
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require("../utils/apifeatures");




//Create product -----aadmin routes
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
}
)





// Get All Product (Admin)
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
    const products = await Product.find();
  
    res.status(200).json({
      success: true,
      products,
    });
  });
  

//get all product
exports.getAllproducts = catchAsyncError(async (req, res) => {



    const resultPerPage = 8;
    const productsCount = await Product.countDocuments()

    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)

//   let products = await apiFeature.query;

//   let filteredProductsCount = products.length;

//   apiFeature.pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    // filteredProductsCount,
  });
});




//update products

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
})


//get product details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    // // console.log(req.params.id)
    // if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    //     return res.status(404).send(`Product Not Found :${req.params.id}`)
    // }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        product
    })

})



//delete product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }

    await product.remove();
    res.status(200).json({
        success: true,
        message: "Product delete successfully"
    })
})







//Create new review or update the reviews
exports.createProductReviews = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating),
                    (rev.comment = comment)
        })
    }
    else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }


    let avg = 0;
    product.reviews.forEach((rev) => {
        avg = avg + rev.rating
    })
    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})


//get all reviews of a product

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }


    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})



//delete review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString())

    let avg = 0;
    reviews.forEach((rev) => {
        avg = avg + rev.rating
    })
    const ratings = avg / reviews.length

    const numOfReivews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReivews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    // await reviews.remove();
    res.status(200).json({
        success: true,

    })
})
