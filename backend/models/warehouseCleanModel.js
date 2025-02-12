
// const mongoose = require('mongoose');

// const warehouseProductSchema = new mongoose.Schema(
//     {
//         title: { type: String, required: true },
//         price: { type: Number, required: true },
//         quantity: { type: Number, required: true },
//         type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
//         status: { type: String, enum: ["Pending", "Sold Out", "Canceled"], default: "Pending" },
//  // New status field
//         soldQuantity: { type: Number, default: 0 } // Stores last sold quantity
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model('WarehouseProduct', warehouseProductSchema);



const mongoose = require('mongoose');

const warehouseProductSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        originalQuantity: { type: Number },
        type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
        status: { type: String, enum: ["Pending", "Sold Out", "Canceled"], default: "Pending" },
        soldQuantity: { type: Number, default: 0 }
        
    },
    { timestamps: true }
);

module.exports = mongoose.model('WarehouseProduct', warehouseProductSchema);
