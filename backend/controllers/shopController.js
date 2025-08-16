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

exports.assignProductToShop = async (req, res) => {
  const { shopId } = req.params;
  const { productId, variantAssignments } = req.body; // variantAssignments = [{ variantId, quantity }, ...]

  try {
    if (
      !productId ||
      !variantAssignments ||
      !Array.isArray(variantAssignments)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid product or variant assignments." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });

    // Check if description is missing and provide a default
    if (!product.description) {
      product.description = "No description available."; // Set default description
      await product.save(); // Save the updated product
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ error: "Shop not found." });

    let totalAssigned = 0;
    for (const { variantId, quantity } of variantAssignments) {
      const variant = product.variants.find(
        (v) => v._id.toString() === variantId
      );
      if (!variant || quantity > variant.quantity) {
        return res.status(400).json({
          error: `Invalid variant or insufficient stock for variant ${variantId}.`,
        });
      }
      variant.quantity -= quantity;
      totalAssigned += quantity;
    }

    await product.save();

    const existingProduct = shop.products.find(
      (p) => p.product.toString() === productId
    );
    if (existingProduct) {
      variantAssignments.forEach(({ variantId, quantity }) => {
        const existingVariant = existingProduct.variants.find(
          (v) => v.variant.toString() === variantId
        );
        if (existingVariant) {
          existingVariant.assignedQuantity += quantity;
        } else {
          existingProduct.variants.push({
            variant: variantId,
            assignedQuantity: quantity,
          });
        }
      });
    } else {
      shop.products.push({
        product: productId,
        variants: variantAssignments.map(({ variantId, quantity }) => ({
          variant: variantId,
          assignedQuantity: quantity,
        })),
      });
    }

    await shop.save();

    res.status(200).json({ message: "Product assigned successfully.", shop });
  } catch (error) {
    console.error("Error assigning product:", error);
    res.status(500).json({ error: error.message });
  }
};

// new one
exports.getShopProducts = async (req, res) => {
  const { shopId } = req.params;

  try {
    const shop = await Shop.findById(shopId)
      .populate({
        path: "products.product",
        model: "Product",
        select: "title price brand variants", // select only needed fields
        populate: {
          path: "brand",
          model: "Brand",
          select: "name", // adjust as per your Brand model fields
        },
      })
      .populate({
        path: "products.variants.variant",
        model: "Variant",
        select: "subBarcode quantity", // only needed fields from variant
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


// exports.getShopProducts = async (req, res) => {
//   const { shopId } = req.params;

//   try {
//     const shop = await Shop.findById(shopId)
//       .populate({
//         path: "products.product",
//         model: "Product",
//         select: "title price brand variants",
//         populate: {
//           path: "brand",
//           model: "Brand",
//           select: "name",
//         },
//       })
//       .lean();

//     if (!shop) {
//       return res.status(404).json({ error: "Shop not found" });
//     }

//     const enrichedProducts = shop.products.map((shopProduct) => {
//       const fullProduct = shopProduct.product;

//       const detailedVariants = shopProduct.variants.map(({ variant, assignedQuantity }) => {
//         const fullVariant = fullProduct.variants.find(
//           (v) => v._id.toString() === variant.toString()
//         );

//         return {
//           variantId: variant,
//           assignedQuantity,
//           size: fullVariant?.size,
//           color: fullVariant?.color,
//           subBarcode: fullVariant?.subBarcode,
//           imageUrl: fullVariant?.imageUrl,
//         };
//       });

//       return {
//         productId: fullProduct._id,
//         title: fullProduct.title,
//         price: fullProduct.price,
//         brand: fullProduct.brand?.name,
//         variants: detailedVariants,
//       };
//     });

//     res.status(200).json(enrichedProducts);
//   } catch (error) {
//     console.error("Error fetching shop products:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
