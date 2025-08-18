const express = require("express");
const router = express.Router();

const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  createPostProduct,
  showProduct,
  showSingleProduct,
  deleteProduct,
  updateProduct,
  addComment,
  addLike,
  removeLike,
  showPaginatedProducts,
  getProductsByCategory,
  updateProductQuantity,
  getProductsByShop,
  assignProductToShop,
  // getProductsByBrand,
  getProductsByTitle,
  showAllProductsTitlePrice,
  showPaginatedTitlePrice,
  showAllProducts,
} = require("../controllers/productController");

//product routes
router.post("/product/create", isAuthenticated, isAdmin, createPostProduct);

router.post("/product/assign-to-shop", assignProductToShop);
router.get("/products/shop/:shopId", getProductsByShop);

router.get("/products/show", showProduct);
router.get("/products/paginated", showPaginatedProducts); // <-- Pagination route

router.get('/by-title/:title', getProductsByTitle);
// Get all products by brand
// router.get("/products/brand/:brand", getProductsByBrand);


router.get("/product/:id", showSingleProduct);

router.get("/category/:category", getProductsByCategory);

router.delete("/delete/product/:id", isAuthenticated, isAdmin, deleteProduct);

router.put("/update/product/:id", isAuthenticated, isAdmin, updateProduct);

router.put("/comment/product/:id", isAuthenticated, addComment);

router.put("/addlike/product/:id", isAuthenticated, addLike);

router.put("/removelike/product/:id", isAuthenticated, removeLike);

router.put(
  "/product/update-quantity/:id",
  isAuthenticated,
  updateProductQuantity
);

module.exports = router;
