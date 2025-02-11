// const WarehouseProduct = require("../models/warehouseCleanModel");

// // Create a new warehouse product
// exports.createWarehouseProduct = async (req, res) => {
//     try {
//         const { title, price, quantity, type } = req.body;

//         if (!title || !price || !quantity || !type) {
//             return res.status(400).json({ error: "All fields are required" });
//         }

//         const newProduct = new WarehouseProduct({ title, price, quantity, type });
//         await newProduct.save();

//         res.status(201).json({ message: "Product created successfully", product: newProduct });
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// };

// // Get all warehouse products
// exports.getWarehouseProducts = async (req, res) => {
//     try {
//         const products = await WarehouseProduct.find();
//         res.status(200).json(products);
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// };

// // Get a single warehouse product by ID
// exports.getWarehouseProductById = async (req, res) => {
//     try {
//         const product = await WarehouseProduct.findById(req.params.id);

//         if (!product) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         res.status(200).json(product);
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// };

// // Update a warehouse product
// exports.updateWarehouseProduct = async (req, res) => {
//     try {
//         const { title, price, quantity, type } = req.body;
//         const updatedProduct = await WarehouseProduct.findByIdAndUpdate(
//             req.params.id,
//             { title, price, quantity, type },
//             { new: true }
//         );

//         if (!updatedProduct) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// };

// // Delete a warehouse product
// exports.deleteWarehouseProduct = async (req, res) => {
//     try {
//         const deletedProduct = await WarehouseProduct.findByIdAndDelete(req.params.id);

//         if (!deletedProduct) {
//             return res.status(404).json({ error: "Product not found" });
//         }

//         res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// };




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

        // Ensure all products have a status field
        const updatedProducts = products.map((product) => ({
            ...product._doc,
            status: product.status || "Pending",
        }));

        res.status(200).json({ success: true, warehouseProducts: updatedProducts });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
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

// Update a warehouse product (including status)
exports.updateWarehouseProduct = async (req, res) => {
    try {
        const { title, price, quantity, type, status } = req.body;
        const updatedProduct = await WarehouseProduct.findByIdAndUpdate(
            req.params.id,
            { title, price, quantity, type, status },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
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

        product.status = status;
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
