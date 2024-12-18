const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const TotalProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"],
        },
        description: {
            type: String,
            required: [true, "description is required"],
        },
        
        price: {
            type: String,
            required: [true, "price is required"],
        },
        
        brand: {
            type: String,
            required: [false, "brand is required"],
        },
       
        postedBy: {
            type: ObjectId,
            ref: "User",
        },
        image: {
            url: String,
            public_id: String,
        },
        likes: [{ type: ObjectId, ref: "User" }],
        comments: [
            {
                text: String,
                created: { type: Date, default: Date.now },
                postedBy: {
                    type: ObjectId,
                    ref: "User",
                },
            },
        ],

        
    },
    { timestamps: true }

    
);



module.exports = mongoose.model('TotalProduct', TotalProductSchema);

