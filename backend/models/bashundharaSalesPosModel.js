// const mongoose = require("mongoose");

// const bashundharaSalesPosSchema = new mongoose.Schema({
//   shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
//   products: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//       variantId: { type: mongoose.Schema.Types.ObjectId },
//       title: String,
//        subBarcode: String,
//       size: String,
//       color: String,
//       price: Number,
//       quantity: Number, // sold qty
//       subtotal: Number
//     }
//   ],
//   customerInfo: {
//     id: String,
//     name: String,
//     mobile: String
//   },
//   totalPrice: { type: Number, required: true },
//   discountAmount: { type: Number, default: 0 },
//   vatRate: { type: Number, default: 0 },
//   vatAmount: { type: Number, default: 0 },
//   netPayable: { type: Number, required: true },
//   paymentMethod: { type: String, enum: ["cash", "card", "bkash"], default: "cash" },
//   cardNumber: { type: String },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("BashundharaSalesPos", bashundharaSalesPosSchema);


const mongoose = require("mongoose");

const bashundharaSalesPosSchema = new mongoose.Schema({
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Shop", 
    required: true 
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variantId: { type: mongoose.Schema.Types.ObjectId },
      title: String,
      subBarcode: String,
      size: String,
      color: String,
      price: Number,
      quantity: Number, // sold qty
      subtotal: Number
    }
  ],
  customerInfo: {
    id: String,
    name: String,
    mobile: String
  },
  totalPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  vatAmount: { type: Number, default: 0 },
  netPayable: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["cash", "card", "bkash"], 
    default: "cash" 
  },
  cardNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Export model
const BashundharaSalesPos = mongoose.model("BashundharaSalesPos", bashundharaSalesPosSchema);

module.exports = BashundharaSalesPos;
