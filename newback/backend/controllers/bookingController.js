const Booking = require("../models/bookingModel");
const Product = require("../models/productModel"); // Keep same as salesController

// Create Booking
exports.createBooking = async (req, res) => {
  try {
    const {
      products,
      customerInfo,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
    } = req.body;

    // Optional: Validate stock but don’t reduce it (since it's just a booking)
    for (const item of products) {
      const { productId, size, color, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.title}` });
      }

      const variant = product.variants.find(
        (v) => v.size === size && v.color === color
      );

      if (!variant) {
        return res.status(404).json({
          message: `Variant not found for product: ${item.title} (${size}, ${color})`,
        });
      }

      if (variant.quantity < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.title} - ${size}, ${color}`,
        });
      }

       // Decrease the quantity
      variant.quantity -= quantity;

      // Save the updated product
      await product.save();
    }

    // Create the booking
    const bookingData = {
      products,
      totalPrice,
      discountAmount,
      vatAmount,
      netPayable,
      status: "Pending",
    };

    if (customerInfo && (customerInfo.id || customerInfo.name || customerInfo.mobile)) {
      bookingData.customerInfo = customerInfo;
    }

    const booking = new Booking(bookingData);
    await booking.save();

    return res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Error creating booking", error });
  }
};





// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving bookings", error });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving booking", error });
  }
};

// Update booking (e.g. change status or customer info)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: "Error updating booking", error });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting booking", error });
  }
};
