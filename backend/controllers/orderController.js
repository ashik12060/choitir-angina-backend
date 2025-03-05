const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel"); // Adjust the path as needed

// Create a new order original code 
// exports.createOrder = async (req, res) => {
//   const decoded = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
//   const orderDate = new Date();

//   // Destructure customer details from the request body
//   const { name, address, phone, deliveryMethod, notes, paymentMethod } = req.body;

//   try {
//     const data = req.body.cart.map((itm) => ({
//       productId: itm._id,
//       quantity: itm.quantity,
//       title:itm.title,
//       price: itm.price,
//     }));

//     const newOrder = new Order({
//       userId: decoded.id,
//       orderDate,
//       orderItems: data,
//       customerDetails: {
//         name,
//         address,
//         phone,
//         deliveryMethod,
//         notes,
//         paymentMethod,
//       },
//       status: "Pending",
//     });

//     await newOrder.save();
//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to place order" });
//   }
// };
// exports.createOrder = async (req, res) => {
//   const decoded = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
//   const orderDate = new Date();

//   // Destructure customer details from the request body
//   const { name, address, phone, deliveryMethod, notes, paymentMethod, cart } = req.body;

//   try {
//     // Check stock before placing the order
//     for (const itm of cart) {
//       const product = await Product.findById(itm._id);
//       if (!product || product.quantity < itm.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Not enough stock for ${itm.title}`,
//         });
//       }
//     }

//     // Reduce product stock
//     for (const itm of cart) {
//       const product = await Product.findById(itm._id);
//       product.quantity -= itm.quantity;
//       await product.save();
//     }

//     // Prepare order items
//     const orderItems = cart.map((itm) => ({
//       productId: itm._id,
//       quantity: itm.quantity,
//       title: itm.title,
//       price: itm.price,
//     }));

//     const newOrder = new Order({
//       userId: decoded.id,
//       orderDate,
//       orderItems,
//       customerDetails: {
//         name,
//         address,
//         phone,
//         deliveryMethod,
//         notes,
//         paymentMethod,
//       },
//       status: "Pending",
//     });

//     await newOrder.save();
//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to place order" });
//   }
// };


exports.createOrder = async (req, res) => {
  const decoded = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
  const orderDate = new Date();

  // Destructure customer details from the request body
  const { name, address, phone, deliveryMethod, notes, paymentMethod, cart } = req.body;

  try {
    // Check stock before placing the order
    for (const itm of cart) {
      const product = await Product.findById(itm._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found for ${itm.title}` });
      }

      // Find the correct variant based on size & color
      const variant = product.variants.find((v) => v.size === itm.size && v.color === itm.color);
      if (!variant) {
        return res.status(404).json({ success: false, message: `Variant not found for ${itm.title}` });
      }

      // Ensure enough stock is available
      if (variant.quantity < itm.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${itm.title} (Size: ${itm.size}, Color: ${itm.color})` });
      }
    }

    // Reduce product stock (variant-wise)
    for (const itm of cart) {
      await Product.findOneAndUpdate(
        { _id: itm._id, "variants.size": itm.size, "variants.color": itm.color },
        { $inc: { "variants.$.quantity": -itm.quantity } }, // Reduce quantity
        { new: true }
      );
    }

    // Prepare order items
    const orderItems = cart.map((itm) => ({
      productId: itm._id,
      size: itm.size,
      color: itm.color,
      quantity: itm.quantity,
      title: itm.title,
      price: itm.price,
    }));

    const newOrder = new Order({
      userId: decoded.id,
      orderDate,
      orderItems,
      customerDetails: {
        name,
        address,
        phone,
        deliveryMethod,
        notes,
        paymentMethod,
      },
      status: "Pending",
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};


// Fetch all orders with populated product details
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('orderItems.productId', 'name price') // Populate product name and price
      .exec();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};


exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    if (!orders) {
      return res.status(404).json({ success: false, message: "No orders found for this user" });
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};



// Delete order by ID
exports.deleteOrderById = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
};

// Update order status (Delivered / Canceled)
// exports.updateOrderStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   if (!["Pending", "Delivered", "Canceled"].includes(status)) {
//     return res.status(400).json({ success: false, message: "Invalid status" });
//   }

//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     if (status === "Canceled") {
//       for (const item of order.orderItems) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           product.quantity += item.quantity; // Restore stock
//           await product.save();
//         }
//       }
//     }

//     order.status = status;
//     await order.save();
//     res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to update order status" });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   if (!["Pending", "Delivered", "Canceled"].includes(status)) {
//     return res.status(400).json({ success: false, message: "Invalid status" });
//   }

//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     // If order is being canceled, restore product stock
//     if (status === "Canceled") {
//       for (const item of order.orderItems) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           product.quantity += item.quantity; // Re-add stock
//           await product.save();
//         }
//       }
//     }

//     order.status = status;
//     await order.save();
//     res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to update order status" });
//   }
// };

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["Pending", "Delivered", "Canceled"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // If order is being canceled, restore product stock for each variant
    if (status === "Canceled" && order.status !== "Canceled") {
      for (const item of order.orderItems) {
        await Product.findOneAndUpdate(
          { _id: item.productId, "variants.size": item.size, "variants.color": item.color },
          { $inc: { "variants.$.quantity": item.quantity } }, // Restore variant quantity
          { new: true }
        );
      }
    }

    order.status = status;
    await order.save();
    res.status(200).json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
