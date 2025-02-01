const cloudinary = require("../utils/cloudinary");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../app");
const Supplier = require("../models/SupplierModel");
const bwipjs = require("bwip-js"); 
const mongoose = require("mongoose");

// newly added
exports.createPostProduct = async (req, res, next) => {
  const {
    title,
    content,
    price,
    description,
    brand, 
    subcategory, 
    supplier,
    categories,
    variants,
    barcode, 
    images, 
  } = req.body;

  try {
  
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({ message: "Supplier does not exist" });
    }

   
    const imageUploadPromises = images.map(async (imageData) => {
      const { image, colorName } = imageData;
      const result = await cloudinary.uploader.upload(image, {
        folder: "products",
        width: 1200,
        crop: "scale",
      });
      return {
        url: result.secure_url,
        public_id: result.public_id,
        color: colorName,
      };
    });

   
    const uploadedImages = await Promise.all(imageUploadPromises);

    const barcodeData = barcode || new mongoose.Types.ObjectId().toString();  
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128", 
      text: barcodeData.toString(), 
      scale: 3, 
      height: 10, 
      includetext: true, 
      textxalign: "center", 
    });

    
    const barcodeBase64 = `data:image/png;base64,${barcodeBuffer.toString(
      "base64"
    )}`;

    
    const product = await Product.create({
      title,
      content,
      price,
      description,
     
      brand,
     
      subcategory,
      postedBy: req.user._id,
      supplier,
      variants,
      categories,
      images: uploadedImages, 
      barcode: barcodeBase64,
      barcodeNumber: barcode, 
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


// Assign products to a shop
exports.assignProductToShop = async (req, res) => {
  const { productIds, shopId } = req.body;
  try {
    const products = await Product.updateMany(
      { _id: { $in: productIds } },
      { shop: shopId }
    );  
    res.status(200).json({ message: 'Products assigned to shop', products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by shop
exports.getProductsByShop = async (req, res) => {
  const { shopId } = req.params;

  try {
    const products = await Product.find({ shop: shopId }).populate('shop');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
// exports.updateProduct = async (req, res, next) => {
//   try {
//     const {
//       title,
//       content,
//       price,
//       quantity,
//       brand,

//       image,
//     } = req.body;
//     const currentProduct = await Product.findById(req.params.id);

//     //build the object data
//     const data = {
//       title: title || currentProduct.title,
//       content: content || currentProduct.content,
//       price: price || currentProduct.price,
//       quantity: quantity || currentProduct.quantity,
//       brand: brand || currentProduct.brand,

//       image: image || currentProduct.image,
//     };

//     //modify product image conditionally
//     if (req.body.image !== "") {
//       const ImgId = currentProduct.image.public_id;
//       if (ImgId) {
//         await cloudinary.uploader.destroy(ImgId);
//       }

//       const newImage = await cloudinary.uploader.upload(req.body.image, {
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
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      content,
      price,
      sizes,
      quantity, // If the quantity is passed in the request body, it will update to that
      brand,
      subcategory,
      image,
    } = req.body;

    const currentProduct = await Product.findById(req.params.id);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Decrease the quantity by 1 when adding to the cart (if quantity is not provided in the request body)
    const updatedQuantity =
      quantity !== undefined ? quantity : currentProduct.quantity - 1;

    // Build the updated product data
    const data = {
      title: title || currentProduct.title,
      content: content || currentProduct.content,
      price: price || currentProduct.price,
      quantity: updatedQuantity, // Set updated quantity here
      brand: brand || currentProduct.brand,
      sizes: sizes || currentProduct.sizes,
      subcategory: subcategory || currentProduct.subcategory,
      image: image || currentProduct.image,
    };

    // Modify product image if provided in the request body
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
      totalProducts,
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

exports.updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // The quantity to subtract

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure the quantity is valid (not negative)
    if (product.quantity - quantity < 0) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // Decrease the product's quantity by the requested amount
    product.quantity -= quantity;

    // Save the updated product to the database
    await product.save();

    res.status(200).json({ message: "Product quantity updated", product });
  } catch (error) {
    console.error("Error updating product quantity", error);
    res.status(500).json({ message: "Server error" });
  }
};
