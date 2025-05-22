const cloudinary = require('../utils/cloudinary');
const SellerProduct = require('../models/sellerModel');

exports.createSellerProduct = async (req, res, next) => {
  const { name, price, image } = req.body;

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "products",
      width: 1200,
      crop: "scale"
    });

    // Create new product
    const product = await SellerProduct.create({
      name,
      price,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.getAllSellerProducts = async (req, res) => {
    try {
      const products = await SellerProduct.find();
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
  
  exports.getSellerProductById = async (req, res) => {
    try {
      const product = await SellerProduct.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };