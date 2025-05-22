const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
    title: { type: String, required: true }, // Add title here
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },   // Ensure size is part of the schema
  color: { type: String, required: true },  // Ensure color is part of the schema
});


const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  orderItems: { type: [orderItemSchema], required: true },
  customerDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryMethod: { type: String, required: true },
    notes: { type: String },
    paymentMethod: { type: String, required: true },
  },
  status: { type: String, enum: ["Pending", "Delivered", "Cancelled"], default: "Pending" },
});

module.exports = mongoose.model("Order", orderSchema);
