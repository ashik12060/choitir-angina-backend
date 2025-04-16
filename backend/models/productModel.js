const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;
const { Schema } = mongoose;


const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  productLength: { type: Number, default: 0 },
  subBarcode: String,
  subBarcodeSvg: String,
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    
    // shop 
    // shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    shop: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],

    
    content: {
      type: String,
      required: [true, "content is required"],
    },
    description: {
      type: String,
      required: [false, "content is required"],
    },

   

    price: {
      type: Number,
      required: [true, "price is required"],
    },
   

    variants: [variantSchema], 

   
  
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
