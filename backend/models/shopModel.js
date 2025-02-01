const mongoose = require('mongoose');

// const shopSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Shop', shopSchema);


// new schema added for shop
const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      assignedQuantity: { type: Number, required: true, default: 0 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shop", shopSchema);
