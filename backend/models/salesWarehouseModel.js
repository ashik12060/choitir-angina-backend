// models/Sale.js
const mongoose = require("mongoose");

const salesWarehouseSchema = new mongoose.Schema({
  warehouseProducts: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WarehouseProduct",
        required: true,
      },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
    },
  ],

  customerName: { type: String },
  customerPhone: { type: String },
  customerAddress: { type: String },
  totalPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0.0 },
  vatAmount: { type: Number, default: 0.0 },
  netPayable: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // Cash/Card
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WarehouseSale", salesWarehouseSchema);
