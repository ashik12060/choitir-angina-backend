const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  productLength: { type: Number, default: 0 },
});

module.exports = mongoose.model("Variant", variantSchema);
