const cloudinary = require("../utils/cloudinary");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../app");
const Supplier = require('../models/SupplierModel');
const bwipjs = require('bwip-js'); // Import barcode library
const mongoose = require('mongoose');  // Add this line to import mongoose


//create product

// exports.createPostProduct = async (req, res, next) => {
//   const {
//     title,
//     content,
//     price,
//     quantity,
//     brand,
//     supplier, 
//     categories,
//     image,
    
//     likes,
//     comments,
//   } = req.body;

//   try {
//     // Check if the supplier exists in the database
//     const supplierExists = await Supplier.findById(supplier);
//     if (!supplierExists) {
//       return res.status(400).json({ message: 'Supplier does not exist' });
//     }

//     // cloudinary setup
//     const result = await cloudinary.uploader.upload(image, {
//       folder: "products",
//       width: 1200,
//       crop: "scale",
//     });

//     // Create the product
//     const product = await Product.create({
//       title,
//       content,
//       price,
//       quantity,
//       brand,
//       postedBy: req.user._id, // Assuming the user is logged in and their ID is available
//       supplier, // Using the supplier ID provided in the request
//       categories,
//       image: {
//         public_id: result.public_id,
//         url: result.secure_url,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };


exports.createPostProduct = async (req, res, next) => {
  const {
    title,
    content,
    price,
    quantity,
    brand,
    supplier,
    categories,
    image,
  } = req.body;

  try {
    // Check if the supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({ message: 'Supplier does not exist' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'products',
      width: 1200,
      crop: 'scale',
    });

    // Generate barcode based on unique product ID
    const barcodeData = new mongoose.Types.ObjectId(); // Generate a unique identifier for the barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: barcodeData.toString(), // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in mm
      includetext: true,     // Show human-readable text
      textxalign: 'center',  // Align text to center
    });

    // Convert barcode to base64 string
    const barcodeBase64 = `data:image/png;base64,${barcodeBuffer.toString('base64')}`;

    // Create the product with the generated barcode
    const product = await Product.create({
      title,
      content,
      price,
      quantity,
      brand,
      postedBy: req.user._id,
      supplier,
      categories,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      barcode: barcodeBase64, // Save barcode in the database
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// single product
exports.showProduct = async (req, res, next) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// single product
exports.showSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "comments.postedBy",
      "name"
    );
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
 


// Delete showProduct
exports.deleteProduct = async (req, res, next) => {
  const currentProduct = await Product.findById(req.params.id);

  //delete post image in cloudinary
  const ImgId = currentProduct.image.public_id;
  if (ImgId) {
    await cloudinary.uploader.destroy(ImgId);
  }

  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    res.status(200).json({
      success: true,
      message: "product deleted",
    });
  } catch (error) {
    next(error);
  }
};

// update product
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      content,
      price,
      quantity,
      brand,
      
      image,
    } = req.body;
    const currentProduct = await Product.findById(req.params.id);

    //build the object data
    const data = {
      title: title || currentProduct.title,
      content: content || currentProduct.content,
      price: price || currentProduct.price,
      quantity: quantity || currentProduct.quantity,
      brand: brand || currentProduct.brand,
      
      image: image || currentProduct.image,
    };

    //modify product image conditionally
    if (req.body.image !== "") {
      const ImgId = currentProduct.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const newImage = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const productUpdate = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      productUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// comments
exports.addComment = async (req, res, next) => {
  const { comment } = req.body;
  try {
    const productComment = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: { text: comment, postedBy: req.user._id } },
      },
      { new: true }
    );
    const product = await Product.findById(productComment._id).populate(
      "comments.postedBy",
      "name email"
    );
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// likes
exports.addLike = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likes: req.user._id },
      },
      { new: true }
    );
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("add-like", products);

    res.status(200).json({
      success: true,
      product,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// like removing functionality
exports.removeLike = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("remove-like", products);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

//pagination
// Pagination for products
exports.showPaginatedProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 12; // Number of products per page

  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("postedBy", "name");

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts
    });
  } catch (error) {
    console.error(error);
    next(new ErrorResponse("Failed to load products", 500));
  }
};



// Filter products by category
exports.getProductsByCategory = async (req, res, next) => {
  const category = req.params.category; // Get category from URL

  try {
    const products = await Product.find({ categories: category })
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};









// const cloudinary = require("../utils/cloudinary");
// const Product = require("../models/productModel");
// const Supplier = require("../models/SupplierModel"); // Import Supplier model
// const ErrorResponse = require("../utils/errorResponse");
// const main = require("../app");

// // Create product
// exports.createPostProduct = async (req, res, next) => {
//   const { title, content, price, brand, supplier, image } = req.body;

//   try {
//     // Validate supplier ID
//     const existingSupplier = await Supplier.findById(supplier);
//     if (!existingSupplier) {
//       return next(new ErrorResponse("Supplier not found", 404));
//     }

//     // Cloudinary image upload
//     const result = await cloudinary.uploader.upload(image, {
//       folder: "products",
//       width: 1200,
//       crop: "scale",
//     });

//     const product = await Product.create({
//       title,
//       content,
//       price,
//       brand,
//       supplier, // Save supplier ID reference
//       postedBy: req.user._id,
//       image: {
//         public_id: result.public_id,
//         url: result.secure_url,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

// // Get all products
// exports.showProduct = async (req, res, next) => {
//   try {
//     const products = await Product.find()
//       .sort({ createdAt: -1 })
//       .populate("postedBy", "name")
//       .populate("supplier", "name phone email address"); // Populate supplier info

//     res.status(201).json({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get single product
// exports.showSingleProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("comments.postedBy", "name")
//       .populate("supplier", "name phone email address"); // Populate supplier info

//     if (!product) {
//       return next(new ErrorResponse("Product not found", 404));
//     }

//     res.status(200).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update product
// exports.updateProduct = async (req, res, next) => {
//   try {
//     const { title, content, price, brand, supplier, image } = req.body;
//     const currentProduct = await Product.findById(req.params.id);

//     if (!currentProduct) {
//       return next(new ErrorResponse("Product not found", 404));
//     }

//     // Validate supplier ID if provided
//     if (supplier) {
//       const existingSupplier = await Supplier.findById(supplier);
//       if (!existingSupplier) {
//         return next(new ErrorResponse("Supplier not found", 404));
//       }
//     }

//     const data = {
//       title: title || currentProduct.title,
//       content: content || currentProduct.content,
//       price: price || currentProduct.price,
//       brand: brand || currentProduct.brand,
//       supplier: supplier || currentProduct.supplier,
//     };

//     // Modify product image conditionally
//     if (image && image !== "") {
//       const ImgId = currentProduct.image.public_id;
//       if (ImgId) {
//         await cloudinary.uploader.destroy(ImgId);
//       }

//       const newImage = await cloudinary.uploader.upload(image, {
//         folder: "products",
//         width: 1200,
//         crop: "scale",
//       });

//       data.image = {
//         public_id: newImage.public_id,
//         url: newImage.secure_url,
//       };
//     }

//     const productUpdate = await Product.findByIdAndUpdate(req.params.id, data, {
//       new: true,
//     });

//     res.status(200).json({
//       success: true,
//       productUpdate,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
