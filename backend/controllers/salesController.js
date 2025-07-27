const Sale = require('../models/salesModel');
const Product = require("../models/productModel"); // Adjust path if needed


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




// exports.getAllSales = async (req, res) => {
//   try {
//     const sales = await Sale.find();
//     return res.status(200).json(sales);
//   } catch (error) {
//     return res.status(500).json({ message: 'Error retrieving sales', error });
//   }
// };
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