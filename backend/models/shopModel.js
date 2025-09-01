const mongoose = require("mongoose");
const Variant = require("../models/variantModel"); // Import the Variant model

// const shopSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: { type: String },
//   products: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       variants: [
//         {
//           variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
//           assignedQuantity: { type: Number, required: true, default: 0 },
//         }
//       ]
//     }
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },

  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

      // snapshot of product info
      title: String,
      content: String,
      price: Number,
      brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
      categories: [String],

      variants: [
        {
          variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // original variant ref
          size: String,
          color: String,
          description: String,
          subBarcode: String,
          subBarcodeSvg: String,
          imageUrl: String,
          imagePublicId: String,

          assignedQuantity: { type: Number, default: 0 }, // stock for this shop
        }
      ],
    }
  ],

  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Shop", shopSchema);

