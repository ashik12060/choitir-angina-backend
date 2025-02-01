const Shop = require('../models/shopModel');
const Product = require("../models/productModel");

// Create a new shop
exports.createShop = async (req, res) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all shops
exports.getShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// // Assign a product to a shop
// exports.assignProductToShop = async (req, res) => {
//   const { shopId } = req.params;
//   const { productId, quantity } = req.body;

//   try {
//     // Validate inputs
//     if (!productId || !quantity || quantity <= 0) {
//       return res.status(400).json({ error: "Invalid product or quantity." });
//     }

//     // Find the product
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found." });
//     }

//     // Check available stock
//     const totalStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
//     if (quantity > totalStock) {
//       return res.status(400).json({ error: "Insufficient stock available." });
//     }

//     // Deduct stock from product variants
//     let remainingToAssign = quantity;
//     product.variants.forEach((variant) => {
//       if (remainingToAssign > 0) {
//         const assignFromVariant = Math.min(remainingToAssign, variant.quantity);
//         variant.quantity -= assignFromVariant;
//         remainingToAssign -= assignFromVariant;
//       }
//     });
//     await product.save();

//     // Find the shop
//     const shop = await Shop.findById(shopId);
//     if (!shop) {
//       return res.status(404).json({ error: "Shop not found." });
//     }

//     // Check if product is already assigned to the shop
//     const existingProduct = shop.products.find((p) => p.product.toString() === productId);
//     if (existingProduct) {
//       existingProduct.assignedQuantity += quantity;
//     } else {
//       shop.products.push({ product: productId, assignedQuantity: quantity });
//     }

//     await shop.save();

//     res.status(200).json({ message: "Product assigned successfully.", shop });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



exports.assignProductToShop = async (req, res) => {
  const { shopId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Validate inputs
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product or quantity." });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Ensure variants exist before reducing stock
    const totalStock = product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, variant) => sum + variant.quantity, 0)
      : 0;

    if (quantity > totalStock) {
      return res.status(400).json({ error: "Insufficient stock available." });
    }

    // Deduct stock from product variants
    let remainingToAssign = quantity;
    product.variants.forEach((variant) => {
      if (remainingToAssign > 0) {
        const assignFromVariant = Math.min(remainingToAssign, variant.quantity);
        variant.quantity -= assignFromVariant;
        remainingToAssign -= assignFromVariant;
      }
    });
    await product.save();

    // Find the shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found." });
    }

    // Ensure shop.products array exists
    if (!shop.products) {
      shop.products = [];
    }

    // Check if product is already assigned to the shop
    const existingProduct = shop.products.find((p) => p.product.toString() === productId);
    if (existingProduct) {
      existingProduct.assignedQuantity += quantity;
    } else {
      shop.products.push({ product: productId, assignedQuantity: quantity });
    }

    await shop.save();

    res.status(200).json({ message: "Product assigned successfully.", shop });
  } catch (error) {
    console.error("Error assigning product:", error);
    res.status(500).json({ error: error.message });
  }
};
