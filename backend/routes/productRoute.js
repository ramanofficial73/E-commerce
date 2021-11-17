const express = require("express");
const { getAllproducts, createProduct, updateProduct, deleteProduct, getProductDetails ,createProductReviews, getProductReviews, deleteReview, getAdminProducts} = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router
    .route("/products")
    .get(getAllproducts)

    
router
.route("/admin/products")
.get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);



router
    .route("/admin/product/new")
    .post(isAuthenticatedUser,
        authorizeRoles("admin"),
        createProduct)



// router.route("/product/:id").put(updateProduct)
router
    .route("/admin/product/:id")
    .put(isAuthenticatedUser ,authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser ,authorizeRoles("admin"), deleteProduct)
    

router.route("/product/:id").get(getProductDetails)

router.route("/review").put(isAuthenticatedUser, createProductReviews)

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview)





module.exports = router