const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;
const { Schema } = mongoose;


const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    content: {
      type: String,
      required: [true, "content is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },

    variants: [variantSchema], // Add the variants array to the schema

    // quantity: {
    //   type: Number,
    //   required: [true, "quantity is required"],
    // },
  
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    supplier: {
      type: ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    categories: [
      {
        type: String,
        enum: ["All", "Top Brands", "New Arrival", "Unstitched"],
        required: [true, "Category is required"],
      },
    ],

    // sizes: {
    //   type: [Schema.Types.Mixed], // This allows both numbers and strings
    //   required: true,
    //   validate: {
    //     validator: function (v) {
    //       return Array.isArray(v) && v.length > 0;
    //     },
    //     message: 'At least one size must be provided',
    //   },
    // },

    barcode: {
      type: String,
    },
    barcodeNumber: { type: String }, // Custom barcode number
    images: [
      {
        url: String,
        public_id: String,
        color: String,
      },
    ],
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
