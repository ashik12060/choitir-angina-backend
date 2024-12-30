const Brand = require('../models/brandModel');

// Get all brands
exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new Brand
exports.createBrand = async (req, res) => {
    const { brandName, phoneNumber,address,origin } = req.body;
    try {
        const newBrand = new Brand({ brandName, phoneNumber,address,origin });
        await newBrand.save();
        res.status(201).json(newBrand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an Brand
exports.updateBrand = async (req, res) => {
    const { id } = req.params;
    const { brandName, phoneNumber,address,origin  } = req.body;
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            { brandName, phoneNumber,address,origin  },
            { new: true }
        );
        res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an Brand
exports.deleteBrand = async (req, res) => {
    const { id } = req.params;
    try {
        await Brand.findByIdAndDelete(id);
        res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
