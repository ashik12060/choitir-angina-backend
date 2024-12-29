const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String},
    phone: { type: String },
    email: { type: String, unique: true },
    address: { type: String },
    profession: { type: String },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
