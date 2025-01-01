const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

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
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
    },
    // brand: {
    //   type: String,
    //   required: [false, "brand is required"],
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
    barcode: {
      type: String,
    },
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
