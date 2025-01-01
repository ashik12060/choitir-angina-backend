// models/Sale.js
const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title:{ type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
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
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sale', salesSchema);
