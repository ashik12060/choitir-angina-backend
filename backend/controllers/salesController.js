const Sale = require('../models/salesModel');
const Product = require("../models/productModel"); // Adjust path if needed

const Shop = require("../models/shopModel");

// original one
exports.createSale = async (req, res) => {
  try {
    const {
      products,
      customerInfo,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      paymentMethod,
      cardNumber,
    } = req.body;

    // Loop through each product in the sale
    for (const item of products) {
      const { productId, size, color, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.title}` });
      }

      // Find the matching variant (assuming you store variants like this)
      const variant = product.variants.find(
        (v) => v.size === size && v.color === color
      );

      if (!variant) {
        return res.status(404).json({
          message: `Variant not found for product: ${item.title} (${size}, ${color})`,
        });
      }

      // Check if there's enough quantity
      if (variant.quantity < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.title} - ${size}, ${color}`,
        });
      }

      // Decrease the quantity
      variant.quantity -= quantity;

      // Save the updated product
      await product.save();
    }

    // Now create the sale
    const saleData = {
      products,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      paymentMethod,
    };

    if (customerInfo && (customerInfo.id || customerInfo.name || customerInfo.mobile)) {
      saleData.customerInfo = customerInfo;
    }
  // 🆕 Conditionally include cardNumber if payment method is Card
    if (paymentMethod === "Card" && cardNumber) {
      saleData.cardNumber = cardNumber;
    }
    const sale = new Sale(saleData);
    await sale.save();

    return res.status(201).json({ message: "Sale created successfully", sale });
  } catch (error) {
    console.error("Error creating sale:", error);
    return res.status(500).json({ message: "Error creating sale", error });
  }
};

// new one for tesing purporse



// exports.createSale = async (req, res) => {
//   try {
//     const {
//       shopId,
//       products,
//       customerInfo,
//       totalPrice,
//       discountAmount,
//       vatAmount,
//       netPayable,
//       paymentMethod,
//       cardNumber,
//     } = req.body;

//     // Fetch shop with populated products & variants
//     const shop = await Shop.findById(shopId)
//       .populate({
//         path: "products.product",
//         select: "title price variants",
//       })
//       .populate({
//         path: "products.variants.variant",
//         select: "size color quantity",
//       });

//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     // Loop through products to validate availability in shop
//     for (const item of products) {
//       const shopProduct = shop.products.find(
//         (p) => p.product._id.toString() === item.productId
//       );
//       if (!shopProduct) {
//         return res.status(404).json({ message: `Product not in this shop: ${item.title}` });
//       }

//       const shopVariant = shopProduct.variants.find(
//         (v) => v.variant._id.toString() === item.variantId
//       );

//       if (!shopVariant) {
//         return res.status(404).json({
//           message: `Variant not found in this shop: ${item.title}`,
//         });
//       }

//       if (shopVariant.assignedQuantity < item.quantity) {
//         return res.status(400).json({
//           message: `Not enough stock for ${item.title} - ${shopVariant.variant.size}, ${shopVariant.variant.color}`,
//         });
//       }

//       // Deduct assignedQuantity from shop
//       shopVariant.assignedQuantity -= item.quantity;
//     }

//     // Save updated shop quantities
//     await shop.save();

//     // Create sale
//     const sale = new Sale({
//       shopId,
//       products,
//       customerInfo,
//       totalPrice,
//       discountAmount,
//       vatAmount,
//       netPayable,
//       paymentMethod,
//       ...(paymentMethod === "Card" && { cardNumber }),
//     });

//     await sale.save();
//     return res.status(201).json({ message: "Sale created successfully", sale });
//   } catch (error) {
//     console.error("Error creating sale:", error);
//     return res.status(500).json({ message: "Error creating sale", error });
//   }
// };





exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find();
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving sales', error });
  }
};
exports.getAllSales = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from && to) {
      filter.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to + 'T23:59:59.999Z'),
      };
    }

    const sales = await Sale.find(filter);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    return res.status(200).json(sale);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving sale', error });
  }
};

// Update Sale
exports.updateSale = async (req, res) => {
  try {
    const { products, customerInfo, totalPrice, discountAmount, vatAmount, netPayable, paymentMethod } = req.body;

    // Find the sale and update it
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      {
        products,
        customerInfo,
        totalPrice,
        discountAmount,
        vatAmount,
        netPayable,
        paymentMethod,
      },
      { new: true } // Return the updated sale
    );

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    return res.status(200).json({ message: 'Sale updated successfully', sale });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating sale', error });
  }
};

// Delete Sale
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    return res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting sale', error });
  }
};