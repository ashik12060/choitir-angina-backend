

const WarehouseProduct = require("../models/warehouseCleanModel");

// Create a new warehouse product with a default status of "Pending"
exports.createWarehouseProduct = async (req, res) => {
    try {
        const { title, price, quantity, type } = req.body;

        if (!title || !price || !quantity || !type) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newProduct = new WarehouseProduct({ 
            title, 
            price, 
            quantity, 
            type, 
            status: "Pending"  // Default status when creating a product
        });

        await newProduct.save();

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Get all warehouse products, ensuring status is included
exports.getWarehouseProducts = async (req, res) => {
    try {
        const products = await WarehouseProduct.find();

        const updatedProducts = products.map((product) => ({
            ...product._doc,
            status: product.status || "Pending",
        }));

        res.status(200).json({ success: true, warehouseProducts: updatedProducts });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};



exports.updateWarehouseProductQuantity = async (productId, quantitySold) => {
  try {
    // Find the product in the warehouse
    const product = await WarehouseProduct.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if enough stock is available
    if (product.quantity < quantitySold) {
      throw new Error("Not enough stock available");
    }

    // Decrease the product quantity
    product.quantity -= quantitySold;

    // Update the product status if quantity reaches zero
    if (product.quantity === 0) {
      product.status = "Sold Out";
    }

    // Save the updated product
    await product.save();

    console.log(`Updated product ${productId} quantity: ${product.quantity}`);
  } catch (error) {
    console.error("Error updating product quantity:", error);
    throw error;
  }
};



// Get a single warehouse product by ID
exports.getWarehouseProductById = async (req, res) => {
    try {
        const product = await WarehouseProduct.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};



// Update warehouse product (decrement quantity when ordered)
exports.updateWarehouseProduct = async (req, res) => {
    try {
        const { quantity } = req.body; // Quantity to decrement

        // Check if the quantity is valid
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: "Valid quantity is required to decrement" });
        }

        const product = await WarehouseProduct.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if enough stock is available
        if (product.quantity < quantity) {
            return res.status(400).json({ error: "Not enough stock available" });
        }

        // Decrement the product quantity
        product.quantity -= quantity;
        
        // Update the product status if quantity reaches zero
        if (product.quantity === 0) {
            product.status = "Sold Out";
        }

        await product.save();

        res.status(200).json({ message: "Product quantity updated successfully", product });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};


// Update product status (toggle between "Pending" and "Sold Out")
exports.updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const product = await WarehouseProduct.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Update status if required
        product.status = status;

        // If quantity is zero, auto-set to "Sold Out"
        if (product.quantity === 0) {
            product.status = "Sold Out";
        }

        await product.save();

        res.status(200).json({ message: "Product status updated successfully", product });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// Delete a warehouse product
exports.deleteWarehouseProduct = async (req, res) => {
    try {
        const deletedProduct = await WarehouseProduct.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
