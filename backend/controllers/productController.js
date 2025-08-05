const cloudinary = require("../utils/cloudinary");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../app");
const Supplier = require("../models/SupplierModel");
const bwipjs = require("bwip-js");
const mongoose = require("mongoose");

exports.createPostProduct = async (req, res, next) => {
  const {
    title,
    content,
    price,
    brandsname,
    
    supplier,
    categories,
    variants,
    barcode,
  } = req.body;

  console.log("Request body:", req.body); // <-- Add here

  try {
    // 1. Check supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({ message: "Supplier does not exist" });
    }

    // 2. Upload variant image & generate sub-barcode if present
    // const processedVariants = await Promise.all(
    //   variants.map(async (variant) => {
    //     let imageUrl = null;
    //     let imagePublicId = null;

    //     if (variant.imageUrl) {
    //       const result = await cloudinary.uploader.upload(variant.imageUrl, {
    //         folder: "product-variants",
    //         width: 1200,
    //         crop: "scale",
    //       });
    //       imageUrl = result.secure_url;
    //       imagePublicId = result.public_id;
    //     }

    //     let subBarcodeSvg = null;
    //     if (variant.subBarcode) {
    //       const barcodeBuffer = await bwipjs.toBuffer({
    //         bcid: "code128",
    //         text: variant.subBarcode,
    //         scale: 3,
    //         height: 10,
    //         includetext: true,
    //         textxalign: "center",
    //       });
    //       subBarcodeSvg = `data:image/png;base64,${barcodeBuffer.toString(
    //         "base64"
    //       )}`;
    //     }

    //     return {
    //       ...variant,
    //       imageUrl,
    //       imagePublicId,
    //       subBarcodeSvg,
    //     };
    //   })
    // );


    const processedVariants = await Promise.all(
  variants.map(async (variant) => {
    let imageUrl = null;
    let imagePublicId = null;

    if (variant.imageUrl) {
      const result = await cloudinary.uploader.upload(variant.imageUrl, {
        folder: "product-variants",
        width: 1200,
        crop: "scale",
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    let subBarcodeSvg = null;
    if (variant.subBarcode) {
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: variant.subBarcode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });
      subBarcodeSvg = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;
    }

    // ✅ Check if category includes "Stitched"
    const isStitched = categories.includes("Stitched");

    // ✅ Validation
    if (isStitched) {
      if (!variant.multipleSizes || variant.multipleSizes.length === 0) {
        throw new Error("Stitched variants must have multipleSizes");
      }
    } else {
      if (!variant.size || typeof variant.quantity !== "number") {
        throw new Error("Unstitched variants must have size and quantity");
      }
    }

    return {
      ...variant,
      imageUrl,
      imagePublicId,
      subBarcodeSvg,
    };
  })
);


    // 3. Generate main product barcode
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

    // 4. Create product

    const product = await Product.create({
      title,
      content,
      brandsname,
      price,
      // brand,
      // subcategory,
      postedBy: req.user._id,
      supplier,
      categories,
      barcode: barcodeBase64,
      barcodeNumber: barcode,
      variants: processedVariants,
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

exports.assignProductToShop = async (req, res) => {
  const { productIds, shopId } = req.body;
  try {
    const products = await Product.updateMany(
      { _id: { $in: productIds } },
      { shop: shopId }
    );
    res.status(200).json({ message: "Products assigned to shop", products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products by brand name
// exports.getProductsByBrand = async (req, res, next) => {
//   try {
//     const brandId = req.params.brand;
//     const products = await Product.find({ brand: brandId })
//       .populate("brand", "name")
//       .populate("supplier", "name")
//       .populate("shop", "name");

//     res.status(200).json({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// get products by title
// exports.getProductsByTitle = async (req, res) => {
//   try {
//     const title = req.params.title;

//     // Find all products with the given title
//     const products = await Product.find({ title }).sort({ createdAt: -1 });

//     res.status(200).json({ products });
//   } catch (error) {
//     console.error("Error fetching products by title:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.getProductsByTitle = async (req, res) => {
  try {
    // Convert "emaan-adeel" → "emaan adeel"
    const rawSlug = req.params.title;
    const decodedTitle = rawSlug.replace(/-/g, "-");

    // Use case-insensitive match
    const products = await Product.find({
      title: { $regex: new RegExp(`^${decodedTitle}$`, "i") },
    }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products by title:", error);
    res.status(500).json({ message: "Server error", error });
  }
};




// Get products by shop
exports.getProductsByShop = async (req, res) => {
  const { shopId } = req.params;

  try {
    const products = await Product.find({ shop: shopId }).populate("shop");
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

exports.showSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "comments.postedBy",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    // You can log the error for debugging purposes
    console.error(error);

    // Handle cases where the ID is invalid or database errors occur
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Catch all other errors
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const currentProduct = await Product.findById(req.params.id);

    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Only attempt to delete if imagePublicId is actually present
    if (currentProduct.variants && currentProduct.variants.length > 0) {
      for (const variant of currentProduct.variants) {
        if (variant.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(variant.imagePublicId);
          } catch (err) {
            console.warn(
              `Could not delete image from Cloudinary: ${variant.imagePublicId}`
            );
          }
        }
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    next(error);
  }
};


// exports.updateProduct = async (req, res, next) => {
//   try {
//     const {
//       title,
//       titlebrand,
//       content,
//       price,
//       sizes,
//       quantity,
//       brand,
//       subcategory
//     } = req.body;

//     const currentProduct = await Product.findById(req.params.id);
//     if (!currentProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const updatedQuantity =
//       quantity !== undefined ? quantity : currentProduct.quantity - 1;

//     const data = {
//       title: title || currentProduct.title,
//       titlebrand: titlebrand || currentProduct.titlebrand,
//       content: content || currentProduct.content,
//       price: price || currentProduct.price,
//       quantity: updatedQuantity,
//       brand: brand || currentProduct.brand,
//       sizes: sizes || currentProduct.sizes,
//       subcategory: subcategory || currentProduct.subcategory,
//     };

//     // Handle images if new images uploaded
//     if (req.files && req.files.length > 0) {
//       // Optional: remove old images from Cloudinary
//       if (currentProduct.images && currentProduct.images.length > 0) {
//         for (let img of currentProduct.images) {
//           if (img.public_id) {
//             await cloudinary.uploader.destroy(img.public_id);
//           }
//         }
//       }

//       const uploadedImages = [];
//       for (const file of req.files) {
//         const uploadResult = await cloudinary.uploader.upload_stream(
//           {
//             folder: "products",
//             resource_type: "image",
//           },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary upload error:", error);
//               throw error;
//             }
//             uploadedImages.push({
//               public_id: result.public_id,
//               url: result.secure_url,
//             });
//           }
//         );

//         // Stream the file buffer
//         const stream = cloudinary.uploader.upload_stream(uploadResult);
//         stream.end(file.buffer);
//       }
//       data.images = uploadedImages;
//     }

//     const productUpdate = await Product.findByIdAndUpdate(
//       req.params.id,
//       data,
//       { new: true }
//     );

//     res.status(200).json({
//       success: true,
//       productUpdate,
//     });
//   } catch (error) {
//     console.error("Update product error:", error);
//     next(error);
//   }
// };


exports.updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      content,
      price,
      brandsname,
      supplier,
      categories,
      barcode,
      variants,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(400).json({ message: "Supplier does not exist" });
      }
      product.supplier = supplier;
    }

    if (title) product.title = title;
    if (content) product.content = content;
    if (price) product.price = price;
    if (brandsname) product.brandsname = brandsname;
    if (categories) product.categories = categories;

    // Handle barcode
    if (barcode) {
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: "code128",
        text: barcode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });
      product.barcode = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;
      product.barcodeNumber = barcode;
    }

    // Parse variants
    let parsedVariants = [];
    if (variants) {
      parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
      const processedVariants = await Promise.all(
        parsedVariants.map(async (variant) => {
          let imageUrl = variant.imageUrl || null;
          let imagePublicId = variant.imagePublicId || null;

          if (variant.imageUrl && !variant.imagePublicId) {
            const result = await cloudinary.uploader.upload(variant.imageUrl, {
              folder: "product-variants",
              width: 1200,
              crop: "scale",
            });
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
          }

          let subBarcodeSvg = variant.subBarcodeSvg || null;
          if (variant.subBarcode) {
            const barcodeBuffer = await bwipjs.toBuffer({
              bcid: "code128",
              text: variant.subBarcode,
              scale: 3,
              height: 10,
              includetext: true,
              textxalign: "center",
            });
            subBarcodeSvg = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;
          }

          return {
            ...variant,
            imageUrl,
            imagePublicId,
            subBarcodeSvg,
          };
        })
      );

      product.variants = processedVariants;
    }

    // Handle main images if using `req.files`
    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      product.images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        product.images.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    next(error);
  }
};


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
    const { id } = req.params; // Product ID
    const { barcode, quantity } = req.body; // barcode of the variant and quantity to subtract

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.find((v) => v.barcode === barcode);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (variant.quantity - quantity < 0) {
      return res
        .status(400)
        .json({ message: "Not enough stock for this variant" });
    }

    variant.quantity -= quantity;

    await product.save();

    res.status(200).json({
      message: "Variant quantity updated",
      updatedVariant: variant,
    });
  } catch (error) {
    console.error("Error updating variant quantity", error);
    res.status(500).json({ message: "Server error" });
  }
};
