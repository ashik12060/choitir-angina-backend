const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brandName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    origin: { type: String, required: true },
});

module.exports = mongoose.model('Brand', brandSchema);
