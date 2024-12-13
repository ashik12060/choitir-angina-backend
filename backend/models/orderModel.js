const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  orderItems: { type: [orderItemSchema], required: true },
});

module.exports = mongoose.model("Order", orderSchema);
