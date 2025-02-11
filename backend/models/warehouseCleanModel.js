
const mongoose = require('mongoose');

const warehouseProductSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
        status: { type: String, enum: ["Pending", "Sold Out"], default: "Pending" } // New status field
    },
    { timestamps: true }
);

module.exports = mongoose.model('WarehouseProduct', warehouseProductSchema);
