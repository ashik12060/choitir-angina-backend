const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");

// Create a new order
// exports.createOrder = async (req, res) => {
//   const decoded = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
//   const orderDate = new Date();
//   try {
//     const data = [...req.body].map((itm) => ({
//       productId: itm._id,
//       quantity: itm.quantity,
//       price: itm.price,
//     }));
//     const newOrder = new Order({
//       userId: decoded.id,
//       orderDate,
//       orderItems: data,
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
// Create a new order
exports.createOrder = async (req, res) => {
  const decoded = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
  const orderDate = new Date();

  // Destructure customer details from the request body
  const { name, address, phone, deliveryMethod, notes, paymentMethod } = req.body;

  try {
    const data = req.body.cart.map((itm) => ({
      productId: itm._id,
      quantity: itm.quantity,
      price: itm.price,
    }));

    const newOrder = new Order({
      userId: decoded.id,
      orderDate,
      orderItems: data,
      customerDetails: {
        name,
        address,
        phone,
        deliveryMethod,
        notes,
        paymentMethod,
      },
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
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


// Get all orders
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find();
//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Failed to fetch orders" });
//   }
// };

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

