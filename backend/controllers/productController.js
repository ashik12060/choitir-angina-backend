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
    // brandsname,
    brand,
    subcategory,
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
          subBarcodeSvg = `data:image/png;base64,${barcodeBuffer.toString(
            "base64"
          )}`;
        }

        // ✅ Check if category includes "Stitched"
        // const isStitched = categories.includes("Stitched");

        // ✅ Validation
        // if (isStitched) {
        //   if (!variant.multipleSizes || variant.multipleSizes.length === 0) {
        //     throw new Error("Stitched variants must have multipleSizes");
        //   }
        // } else {
        //   if (!variant.size || typeof variant.quantity !== "number") {
        //     throw new Error("Unstitched variants must have size and quantity");
        //   }
        // }

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
      // brandsname,
      price,
      brand,
      subcategory,
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
// exports.showProduct = async (req, res, next) => {
//   try {
//     // Pagination values
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 25;
//     const skip = (page - 1) * limit;

//     // Fetch products with pagination
//     const products = await Product.find()
//       .allowDiskUse(true)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("postedBy", "name");

//     // Count total products
//     const total = await Product.countDocuments();

//     res.status(200).json({
//       success: true,
//       products,
//       pagination: {
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         total,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch products",
//       error: error.message,
//     });
//   }
// };
exports.showProduct = async (req, res, next) => {
  try {
    // Pagination values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find()
      .allowDiskUse(true)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("postedBy", "name");

    // Count total products
    const total = await Product.countDocuments();

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

exports.showAdminProduct = async (req, res, next) => {
  try {
    // Pagination values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Fetch only the required fields
    const products = await Product.find({}, "_id title postedBy createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name") // only get postedBy name
      .lean(); // return plain JS objects, much faster

    // Count total products
    const total = await Product.countDocuments();

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// controllers/productController.js
exports.showAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

exports.showSubbarcodeProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");

    res.status(200).json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET /api/products/stock
// exports.getStockReport = async (req, res) => {
//   try {
//     // Fetch products with title and variants only
//     const products = await Product.find()
//       .select("title variants")
//       .lean();

//     // Map products to total quantities
//     const stockItems = products.map((product) => {
//       const totalQuantity = product.variants?.reduce(
//         (sum, v) => sum + (v.quantity || 0),
//         0
//       ) || 0;

//       return {
//         productName: product.title,
//         totalQuantity,
//       };
//     });

//     res.json({ success: true, products: stockItems });
//   } catch (error) {
//     console.error("Error fetching stock report:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch stock report",
//       error: error.message,
//     });
//   }
// };

// controllers/productController.js

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
// exports.showSingleProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid product ID" });
//     }

//     const product = await Product.findById(id)
//       .populate("comments.postedBy", "name")
//       .populate("brand", "brandName")
//       .populate("supplier", "name")
//       .populate("subcategory", "name");

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     // Ensure all fields exist to avoid frontend crashes
//     const safeProduct = {
//       ...product.toObject(),
//       brand: product.brand || null,
//       supplier: product.supplier || null,
//       subcategory: product.subcategory || null,
//       categories: product.categories || [],
//       variants: product.variants || [],
//       barcode: product.barcode || "",
//       barcodeNumber: product.barcodeNumber || "",
//       priceHistory: product.priceHistory || [],
//     };

//     res.status(200).json({ success: true, product: safeProduct });
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


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

exports.updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      content,
      price,
      // brandsname,
      brand,
      subcategory,
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
    // if (price) product.price = price;
    // ✅ Handle price update with history
    if (price && price !== product.price) {
      if (!product.priceHistory) product.priceHistory = [];

      product.priceHistory.push({
        oldPrice: product.price,
        updatedAt: new Date(),
      });

      product.price = price;
    }

    // if (brandsname) product.brandsname = brandsname;
    if (brand) product.brand = brand;
    if (subcategory) product.subcategory = subcategory;
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
      product.barcode = `data:image/png;base64,${barcodeBuffer.toString(
        "base64"
      )}`;
      product.barcodeNumber = barcode;
    }

    // Parse variants
    let parsedVariants = [];
    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
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
            subBarcodeSvg = `data:image/png;base64,${barcodeBuffer.toString(
              "base64"
            )}`;
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
exports.showPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find({}, "title price variants ")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then((products) =>
          products.map((p) => ({
            ...p,

            variants: p.variants.length
              ? [{ imageUrl: p.variants[0].imageUrl }]
              : [],
          }))
        ),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: error.message,
    });
  }
};

// show products for pos
// controllers/productController.js
// exports.showPaginatedProductsFullVariants = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 21;
//     const skip = (page - 1) * limit;

//     const [products, totalProducts] = await Promise.all([
//       Product.find({}, "title price variants") // include title, price, variants
//         .sort({ createdAt: -1, _id: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean()
//         .then((products) =>
//           products.map((p) => ({
//             ...p,
//             // Return all variants fully
//             variants: p.variants || [],
//           }))
//         ),
//       Product.countDocuments(),
//     ]);

//     res.status(200).json({
//       success: true,
//       products,
//       currentPage: page,
//       totalPages: Math.ceil(totalProducts / limit),
//       totalProducts,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load products",
//       error: error.message,
//     });
//   }
// };

exports.showPaginatedProductsFullVariants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 19;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find({}, "title price variants")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then((products) =>
          products.map((p) => ({
            ...p,
            variants: p.variants.map((v) => ({
              size: v.size,
              color: v.color,
              description: v.description,
              productLength: v.productLength,
              quantity: v.quantity,
              subBarcode: v.subBarcode,
            })),
          }))
        ),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: error.message,
    });
  }
};

// new for all the product request
exports.getAllProductsFullVariants = async (req, res) => {
  try {
    const products = await Product.find({}, "title price variants")
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .then((products) =>
        products.map((p) => ({
          ...p,
          variants: p.variants.map((v) => ({
            size: v.size,
            color: v.color,
            description: v.description,
            productLength: v.productLength,
            quantity: v.quantity,
            subBarcode: v.subBarcode,
          })),
        }))
      );

    res.status(200).json({
      success: true,
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: error.message,
    });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const products = await Product.find({}, "title price variants").lean();

    const stockReport = products.map((p) => {
      const totalQty = p.variants.reduce(
        (sum, v) => sum + (v.quantity || 0),
        0
      );
      return {
        title: p.title,
        price: p.price,
        totalQuantity: totalQty,
      };
    });

    res.status(200).json({
      success: true,
      stockReport,
      totalProducts: stockReport.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock report",
      error: error.message,
    });
  }
};

// get all subbarcode
exports.getAllSubBarcodesWithProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "title price variants")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    const subBarcodes = products.flatMap((product) =>
      (product.variants || [])
        .filter((v) => v.subBarcode) // only keep valid subBarcodes
        .map((v) => ({
          subBarcode: v.subBarcode,
          subBarcodeSvg: v.subBarcodeSvg || null,
          color: v.color || null,
          size: v.size || null,
          productTitle: product.title,
          productPrice: product.price,
        }))
    );

    res.status(200).json({
      success: true,
      totalSubBarcodes: subBarcodes.length,
      subBarcodes,
    });
  } catch (error) {
    console.error("Error fetching subBarcodes with products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load subBarcodes",
      error: error.message,
    });
  }
};

let cache = {};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category.trim(); // category from URL
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const key = `${category}-${page}`;

    // Return cached response if available
    if (cache[key]) {
      return res.json({ success: true, ...cache[key], cached: true });
    }

    // Query products safely
    const [products, total] = await Promise.all([
      Product.find({ categories: { $in: [category] } }) // match exact category
        .select("title variants categories postedBy")
        .populate({ path: "postedBy", select: "name", strictPopulate: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ categories: { $in: [category] } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = {
      currentPage: page,
      totalPages,
      totalProducts: total,
      products,
    };

    // Cache for future requests
    cache[key] = data;

    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
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

// Get product by subBarcode
// exports.getProductBySubBarcode = async (req, res) => {
//   try {
//     const { subBarcode } = req.params;

//     // Find product that contains this subBarcode inside its variants
//     const product = await Product.findOne(
//       { "variants.subBarcode": subBarcode }, // look inside variants array
//       { title: 1, price: 1, variants: 1 }   // only select needed fields
//     ).populate("postedBy", "name");

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found with this SubBarcode",
//       });
//     }

//     // extract only the matching variant
//     const variant = product.variants.find(v => v.subBarcode === subBarcode);

//     res.status(200).json({
//       success: true,
//       product: {
//         _id: product._id,
//         title: product.title,
//         price: product.price,
//         variant,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching product by subBarcode:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch product",
//       error: error.message,
//     });
//   }
// };

exports.getProductBySubBarcode = async (req, res, next) => {
  try {
    // Fetch all products without pagination
    const products = await Product.find()
      .allowDiskUse(true)
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");

    res.status(200).json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
