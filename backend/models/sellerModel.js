const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    public_id: String,
    url: String,
  },
});

module.exports = mongoose.model('SellerProduct', sellerProductSchema);
