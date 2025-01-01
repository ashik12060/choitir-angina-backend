const Sale = require('../models/salesModel');

exports.createSale = async (req, res) => {
  try {
    const { products, customerInfo, totalPrice, discountAmount, vatAmount, netPayable, paymentMethod } = req.body;

    // Create the sale object
    const saleData = {
      products,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      paymentMethod,
    };

    // Only include customerInfo if it's provided
    if (customerInfo && (customerInfo.id || customerInfo.name || customerInfo.mobile)) {
      saleData.customerInfo = customerInfo;
    }

    // Save the sale to the database
    const sale = new Sale(saleData);
    await sale.save();

    return res.status(201).json({ message: 'Sale created successfully', sale });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating sale', error });
  }
};




// Get All Sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find();
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving sales', error });
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