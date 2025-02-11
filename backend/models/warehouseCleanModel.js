// const mongoose = require('mongoose');
// const { ObjectId } = mongoose.Schema;

// const warehouseProductSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Title is required"],
//         },
//         price: {
//             type: Number,
//             required: [true, "Price is required"],
//         },
//         quantity: {
//             type: Number,
//             required: [true, "Quantity is required"],
//         },
//         type: {
//             type: String,
//             enum: ["Stitched", "Unstitched"],
//             required: [true, "Product type is required"],
//         },
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
        type: { type: String, enum: ["Stitched", "Unstitched"], required: true },
        status: { type: String, enum: ["Pending", "Sold Out"], default: "Pending" } // New status field
    },
    { timestamps: true }
);

module.exports = mongoose.model('WarehouseProduct', warehouseProductSchema);
