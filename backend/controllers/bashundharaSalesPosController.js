const Shop = require("../models/shopModel");
const BashundharaSalesPos = require("../models/bashundharaSalesPosModel");

// exports.sellProductBashundhara = async (req, res) => {
//   try {
//     const { shopId, items, paymentMethod } = req.body;

//     const shop = await Shop.findById(shopId);
//     if (!shop) return res.status(404).json({ error: "Shop not found" });

//     let totalAmount = 0;
//     const saleItems = [];

//     for (const { productId, variantId, quantity } of items) {
//       const shopProduct = shop.products.find(
//         p => p.product.toString() === productId
//       );

//       if (!shopProduct) {
//         return res.status(400).json({ error: `Product ${productId} not found in shop` });
//       }

//       const shopVariant = shopProduct.variants.find(
//         v => v.variantId.toString() === variantId
//       );

//       if (!shopVariant || shopVariant.assignedQuantity < quantity) {
//         return res.status(400).json({ error: `Insufficient stock for variant ${variantId}` });
//       }

//       // Deduct stock
//       shopVariant.assignedQuantity -= quantity;

//       const subtotal = shopProduct.price * quantity;
//       totalAmount += subtotal;

//       saleItems.push({
//         productId,
//         variantId,
//         title: shopProduct.title,
//         size: shopVariant.size,
//         color: shopVariant.color,
//         price: shopProduct.price,
//         quantity,
//         subtotal
//       });
//     }

//     await shop.save();

//     const sale = new BashundharaSalesPos({
//       shop: shopId,
//       products: saleItems,
//       totalAmount,
//       paymentMethod
//     });

//     await sale.save();

//     res.json({ message: "Bashundhara POS sale recorded successfully", sale });
//   } catch (error) {
//     console.error("Error in Bashundhara POS sale:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.sellProductBashundhara = async (req, res) => {
//   try {
//     const { items, paymentMethod, discountAmount = 0, vatRate = 0, customerInfo, cardNumber } = req.body;
//     // const { shopId } = req.params;

//     const shop = await Shop.findById(shopId);
//     if (!shop) return res.status(404).json({ error: "Shop not found" });

//     let totalPrice = 0;
//     const saleItems = [];

//     for (const { productId, variantId, quantity, subBarcode } of items) {
//       const shopProduct = shop.products.find(p => p.product.toString() === productId);
//       if (!shopProduct) return res.status(400).json({ error: `Product ${productId} not found in shop` });

//       const shopVariant = shopProduct.variants.find(v => v.variantId.toString() === variantId);
//       if (!shopVariant || shopVariant.assignedQuantity < quantity)
//         return res.status(400).json({ error: `Insufficient stock for variant ${variantId}` });

//       // Deduct stock
//       shopVariant.assignedQuantity -= quantity;

//       const subtotal = shopProduct.price * quantity;
//       totalPrice += subtotal;

//       saleItems.push({
//         productId,
//         variantId,
//         subBarcode,
//         title: shopProduct.title,
//         size: shopVariant.size,
//         color: shopVariant.color,
//         price: shopProduct.price,
//         quantity,
//         subtotal
//       });
//     }

//     await shop.save();

//     // Calculate totals
//     const totalAfterDiscount = totalPrice - discountAmount;
//     const vatAmount = (totalAfterDiscount * vatRate) / 100;
//     const netPayable = totalAfterDiscount + vatAmount;

//     const sale = new BashundharaSalesPos({
//       shop: shopId,
//       products: saleItems,
//       customerInfo,
//       totalPrice,
//       discountAmount,
//       vatRate,
//       vatAmount,
//       netPayable,
//       paymentMethod,
//       ...(paymentMethod === "Card" && { cardNumber })
//     });

//     await sale.save();

//     res.json({
//       message: "Bashundhara POS sale recorded successfully",
//       sale,
//       totalPrice,
//       discountAmount,
//       vatAmount,
//       netPayable
//     });

//   } catch (error) {
//     console.error("Error in Bashundhara POS sale:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



exports.sellProductBashundhara = async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      discountAmount = 0,
      vatRate = 0,
      customerInfo,
      cardNumber,
    } = req.body;

    let totalPrice = 0;
    const saleItems = [];

    // ✅ Loop over items directly (no shop check)
    for (const { productId, variantId, quantity, subBarcode, title, size, color, price } of items) {
      const subtotal = price * quantity;
      totalPrice += subtotal;

      saleItems.push({
        productId,
        variantId,
        subBarcode,
        title,
        size,
        color,
        price,
        quantity,
        subtotal,
      });
    }

    // ✅ Calculate totals
    const totalAfterDiscount = totalPrice - discountAmount;
    const vatAmount = (totalAfterDiscount * vatRate) / 100;
    const netPayable = totalAfterDiscount + vatAmount;

    // ✅ Save sale
    const sale = new BashundharaSalesPos({
      products: saleItems,
      customerInfo,
      totalPrice,
      discountAmount,
      vatRate,
      vatAmount,
      netPayable,
      paymentMethod,
      ...(paymentMethod === "Card" && { cardNumber }),
    });

    await sale.save();

    res.json({
      message: "Bashundhara POS sale recorded successfully",
      sale,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
    });
  } catch (error) {
    console.error("Error in Bashundhara POS sale:", error);
    res.status(500).json({ error: error.message });
  }
};
