const express = require("express");
const { createWarehouseProduct, getWarehouseProducts, getWarehouseProductById, updateWarehouseProduct, deleteWarehouseProduct, updateProductStatus, updateWarehouseProductQuantity } = require("../controllers/warehouseCleanController");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();

// Define routes
router.post("/warehouse-product/create", createWarehouseProduct);
router.get("/warehouse-products/show", getWarehouseProducts);
router.get("/warehouse-product:id", getWarehouseProductById);
// quantity decrease
router.put("/warehouse-product/update-quantity/:id", updateWarehouseProductQuantity);
// update when cancelled
router.put("/warehouse-products/update-status/:id", updateProductStatus);

router.put("/warehouse-product:id", updateWarehouseProduct);
router.delete("/warehouse-product:id",isAuthenticated, isAdmin, deleteWarehouseProduct);

module.exports = router;
