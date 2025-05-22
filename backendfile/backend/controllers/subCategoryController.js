// const Subcategory = require("../models/Subcategory");
// const Brand = require("../models/Brand");

// exports.createSubcategory = async (req, res) => {
//   try {
//     const { name, brandId } = req.body;

//     // Create the subcategory
//     const subcategory = await Subcategory.create({ name, brand: brandId });

//     // Update the brand to include this subcategory
//     await Brand.findByIdAndUpdate(brandId, { $push: { subcategories: subcategory._id } });

//     res.status(201).json(subcategory);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.getSubcategoriesByBrand = async (req, res) => {
//     try {
//       const { brandId } = req.params;
  
//       // Find subcategories by brand
//       const subcategories = await Subcategory.find({ brand: brandId }).populate("products");
//       res.status(200).json(subcategories);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  

//   exports.getSubcategoryDetails = async (req, res) => {
//     try {
//       const { subcategoryId } = req.params;
  
//       // Find subcategory and populate its products
//       const subcategory = await Subcategory.findById(subcategoryId).populate("products");
//       if (!subcategory) return res.status(404).json({ error: "Subcategory not found" });
  
//       res.status(200).json(subcategory);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
const Subcategory = require("../models/subCategoryModel");
const Brand = require("../models/brandModel");


// Create a new Subcategory
exports.createSubcategory = async (req, res) => {
    const { name, brandId } = req.body;

    try {
        // Create the subcategory
        const subcategory = new Subcategory({ name, brand: brandId });
        await subcategory.save();

        // Link the subcategory to the brand
        await Brand.findByIdAndUpdate(brandId, { $push: { subcategories: subcategory._id } });

        res.status(201).json(subcategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get all subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find();
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getSubcategoriesByBrand = async (req, res) => {
    const { brandId } = req.params;

    try {
        const subcategories = await Subcategory.find({ brand: brandId });
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
