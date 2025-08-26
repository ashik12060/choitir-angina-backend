const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesProductTracking", // Same as in sales model
        required: true,
      },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: String,
      color: String,
      status: {
        type: String,
        enum: ["Pending", "Booked", "Cancelled", "Converted to Sale"],
        default: "Pending",
      },
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

  // Optional field: can later link to Sale ID if booking is converted
  linkedSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
  },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },

  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
