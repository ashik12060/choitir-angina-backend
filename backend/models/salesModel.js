const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  products: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SalesProductTracking", // Reference to SalesProductTracking model
        required: true 
      },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: String, 
      color: String, 
      // type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
      status: { type: String, enum: ["Pending", "Sold Out", "Canceled"], default: "Pending" },
    },
  ],

  customerInfo: {
    id: { type: String },
    name: { type: String },
    mobile: { type: String },
  },

  
  totalPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0.0 },
  vatAmount: { type: Number, default: 0.0 },
  netPayable: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // Cash/Card
   cardNumber: {
    type: String,
    required: function () {
      return this.paymentMethod === "Card";
    },
  },

  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", salesSchema);
