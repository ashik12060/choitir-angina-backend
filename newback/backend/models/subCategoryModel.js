// const mongoose = require("mongoose");

// const subcategorySchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Name of the subcategory
//   brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true }, // Reference to the Brand
//   products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // List of related products
// });

// module.exports = mongoose.model("Subcategory", subcategorySchema);


const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true }, // Reference to the Brand
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
