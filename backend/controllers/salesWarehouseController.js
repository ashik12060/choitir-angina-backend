const WarehouseSale = require('../models/salesWarehouseModel');
const { updateWarehouseProductQuantity } = require('./warehouseCleanController');
const WarehouseProduct = require("../models/warehouseCleanModel");

// exports.createWarehouseSale = async (req, res) => {
//   try {
//     const { customerName,customerPhone,customerAddress,warehouseProducts, totalPrice, discountAmount, vatAmount, netPayable, paymentMethod } = req.body;

//     // Create the sale object
//     const saleData = {
//       warehouseProducts,
//       totalPrice,
//       discountAmount,
//       vatAmount,
//       netPayable,
//       paymentMethod,
//       customerAddress,
//       customerPhone,
//       customerName,

//     };

  

//     // Save the sale to the database
//     const sale = new WarehouseSale(saleData);
//     await sale.save();

//     return res.status(201).json({ message: 'Sale created successfully', sale });
//   } catch (error) {
//     return res.status(500).json({ message: 'Error creating sale', error });
//   }
// };




// Get All Sales


exports.createWarehouseSale = async (req, res) => {
  try {
    const { 
      customerName,
      customerPhone,
      customerAddress,
      warehouseProducts,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      paymentMethod
    } = req.body;

    // Create the sale object
    const saleData = {
      warehouseProducts,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      paymentMethod,
      customerAddress,
      customerPhone,
      customerName,
    };

    // Save the sale to the database
    const sale = new WarehouseSale(saleData);
    await sale.save();

    // After sale, update the quantity in the warehouse
    for (const product of warehouseProducts) {
      // Update the product quantity in the warehouse after sale
      await updateWarehouseProductQuantity(product.productId, product.quantity);
    }

    return res.status(201).json({ message: 'Sale created successfully', sale });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating sale', error });
  }
};


//  Function to update product status
exports.updateProductStatusSales = async (req, res) => {
  try {
    const { saleId, productId } = req.params;
    const { status } = req.body;

    console.log("Updating product status:", { saleId, productId, status });

    //  Find the sale
    const sale = await WarehouseSale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    //  Find the product inside the sale
    const productIndex = sale.warehouseProducts.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in sale" });
    }

    // ✅ Update product status
    sale.warehouseProducts[productIndex].status = status;

    // ✅ If "Canceled", restore quantity in WarehouseProduct
    if (status === "Canceled") {
      const warehouseProduct = await WarehouseProduct.findById(productId);
      if (warehouseProduct) {
        warehouseProduct.quantity += sale.warehouseProducts[productIndex].quantity;
        await warehouseProduct.save();
      }
    }

    // ✅ Save updated sale
    await sale.save();

    res.status(200).json({ message: "Product status updated", sale });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



exports.getAllWarehouseSales = async (req, res) => {
  try {
    const sales = await WarehouseSale.find();
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving sales', error });
  }
};

// Get Sale by ID
exports.getWarehouseSaleById = async (req, res) => {
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
exports.updateWarehouseSale = async (req, res) => {
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
exports.deleteWarehouseSale = async (req, res) => {
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