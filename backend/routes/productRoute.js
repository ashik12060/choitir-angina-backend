const express = require("express");
const router = express.Router();


const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  createPostProduct,
  showProduct,
  showSingleProduct,
  deleteProduct,

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

  updateProduct,
  getProductBySubBarcode,
  showSubbarcodeProducts,
  showAllProducts,
  showProductsForPOS,
  showPaginatedPOSProducts,
  showPaginatedProductsFullVariants,
  getAllProductsFullVariants,
  getStockReport,
 
} = require("../controllers/productController");


console.log({
  updateProduct,
  updateProductQuantity,
  addComment,
  addLike,
  removeLike,
});
//product routes
router.post("/product/create", isAuthenticated, isAdmin, createPostProduct);

router.post("/product/assign-to-shop", assignProductToShop);
router.get("/products/shop/:shopId", getProductsByShop);

router.get("/products/show", showProduct);
router.get("/products/paginated", showPaginatedProducts); // <-- Pagination route

router.get('/by-title/:title', getProductsByTitle);
// Get all products by brand
// router.get("/products/brand/:brand", getProductsByBrand);

router.get("/products/by-subbarcode", showSubbarcodeProducts);
router.get("/products/showall", showAllProducts);

// router.get("/products/pos", showPaginatedProductsFullVariants);
router.get("/products/pos", getAllProductsFullVariants);

router.get("/products/stock", getStockReport);


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
