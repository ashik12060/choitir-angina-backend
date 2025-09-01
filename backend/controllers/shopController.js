const Shop = require("../models/shopModel");
const Product = require("../models/productModel");

// Create a new shop
exports.createShop = async (req, res) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all shops
exports.getShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// main code

// exports.assignProductToShop = async (req, res) => {
//   const { shopId } = req.params;
//   const { productId, variantAssignments } = req.body; // variantAssignments = [{ variantId, quantity }, ...]

//   try {
//     if (
//       !productId ||
//       !variantAssignments ||
//       !Array.isArray(variantAssignments)
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Invalid product or variant assignments." });
//     }

//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found." });

//     // Check if description is missing and provide a default
//     if (!product.description) {
//       product.description = "No description available."; // Set default description
//       await product.save(); // Save the updated product
//     }

//     const shop = await Shop.findById(shopId);
//     if (!shop) return res.status(404).json({ error: "Shop not found." });

//     let totalAssigned = 0;
//     for (const { variantId, quantity } of variantAssignments) {
//       const variant = product.variants.find(
//         (v) => v._id.toString() === variantId
//       );
//       if (!variant || quantity > variant.quantity) {
//         return res.status(400).json({
//           error: `Invalid variant or insufficient stock for variant ${variantId}.`,
//         });
//       }
//       variant.quantity -= quantity;
//       totalAssigned += quantity;
//     }

//     await product.save();

//     const existingProduct = shop.products.find(
//       (p) => p.product.toString() === productId
//     );
//     if (existingProduct) {
//       variantAssignments.forEach(({ variantId, quantity }) => {
//         const existingVariant = existingProduct.variants.find(
//           (v) => v.variant.toString() === variantId
//         );
//         if (existingVariant) {
//           existingVariant.assignedQuantity += quantity;
//         } else {
//           existingProduct.variants.push({
//             variant: variantId,
//             assignedQuantity: quantity,
//           });
//         }
//       });
//     } else {
//       shop.products.push({
//         product: productId,
//         variants: variantAssignments.map(({ variantId, quantity }) => ({
//           variant: variantId,
//           assignedQuantity: quantity,
//         })),
//       });
//     }

//     await shop.save();

//     res.status(200).json({ message: "Product assigned successfully.", shop });
//   } catch (error) {
//     console.error("Error assigning product:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
// new code
exports.assignProductToShop = async (req, res) => {
  const { shopId } = req.params;
  const { productId, variantAssignments } = req.body;

  try {
    const product = await Product.findById(productId).populate("brand");
    if (!product) return res.status(404).json({ error: "Product not found." });

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ error: "Shop not found." });

    const variantsForShop = [];

    for (const { variantId, quantity } of variantAssignments) {
      const variant = product.variants.id(variantId); // find embedded variant
      if (!variant || quantity > variant.quantity) {
        return res.status(400).json({ error: `Invalid or insufficient stock for variant ${variantId}` });
      }

      // deduct from warehouse
      variant.quantity -= quantity;

      // copy into shop
      variantsForShop.push({
        variantId: variant._id,
        size: variant.size,
        color: variant.color,
        description: variant.description,
        subBarcode: variant.subBarcode,
        subBarcodeSvg: variant.subBarcodeSvg,
        imageUrl: variant.imageUrl,
        imagePublicId: variant.imagePublicId,
        assignedQuantity: quantity,
      });
    }

    await product.save();

    // store product snapshot in shop
    shop.products.push({
      product: product._id,
      title: product.title,
      content: product.content,
      price: product.price,
      brand: product.brand?._id,
      categories: product.categories,
      variants: variantsForShop,
    });

    await shop.save();

    res.status(200).json({ message: "Product assigned successfully.", shop });
  } catch (error) {
    console.error("Error assigning product:", error);
    res.status(500).json({ error: error.message });
  }
};



// old one
// exports.getShopProducts = async (req, res) => {
//   const { shopId } = req.params;

//   try {
//     const shop = await Shop.findById(shopId)
//       .populate({
//         path: "products.product",
//         model: "Product",
//         select: "title price brand variants", // select only needed fields
//         populate: {
//           path: "brand",
//           model: "Brand",
//           select: "name", // adjust as per your Brand model fields
//         },
//       })
//       .populate({
//         path: "products.variants.variant",
//         model: "Variant",
//         select: "subBarcode quantity", // only needed fields from variant
//       });

//     if (!shop) {
//       return res.status(404).json({ error: "Shop not found" });
//     }

//     res.status(200).json(shop.products);
//   } catch (error) {
//     console.error("Error fetching shop products:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

exports.getShopProducts = async (req, res) => {
  const { shopId } = req.params;

  try {
    const shop = await Shop.findById(shopId)
      .populate({
        path: "products.product",
        model: "Product",
        select: "title price variants imageUrl", // fields you want from Product
      })
      .populate({
        path: "products.variants.variant",
        model: "Variant",
        select: "size color quantity subBarcode imageUrl description", // fields you want from Variant
      });

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.status(200).json(shop.products);
  } catch (error) {
    console.error("Error fetching shop products:", error);
    res.status(500).json({ error: error.message });
  }
};



// exports.getShopById = async (req, res) => {
//   try {
//     const shop = await Shop.findById(req.params.id)
//       .populate({
//         path: "products.product",
//         select: "title price variants",
//       })
//       .populate({
//         path: "products.variants.variant",
//         select: "size color quantity",
//       });

//     if (!shop) return res.status(404).json({ message: "Shop not found" });

//     res.json(shop);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };


exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate({
        path: "products.product",
        select: "title price content barcode subBarcode variants", // include extra fields
      })
      .populate({
        path: "products.variants.variant",
        select: "size color quantity subBarcode", // include subBarcode in variant too
      });

    if (!shop) return res.status(404).json({ message: "Shop not found" });

    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
