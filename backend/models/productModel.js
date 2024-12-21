const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
        },
        content: {
            type: String,
            required: [true, "content is required"],
        },
        // features start
        price: {
            type: String,
            required: [true, "price is required"],
        },
        quantity: {
            type: String,
            required: [true, "quantity is required"],
        },
        
        brand: {
            type: String,
            required: [false, "brand is required"],
        },
       
        postedBy: {
            type: ObjectId,
            ref: "User",
        },
        supplier: {
            type: ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier is required'],
          },
          categories: [
            {
              type: String,
              enum: ['All', 'Top Brands', 'New Arrival', 'Unstitched'], // Define categories here
              required: [true, "Category is required"],
            },
          ],

          
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



module.exports = mongoose.model('Product', productSchema);

