const cloudinary = require("../utils/cloudinary");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const main = require("../app");


//create product
exports.createPostProduct = async (req, res, next) => {
  const {
    title,
    content,
    price,
    brand,
    postedBy,
    image,
    likes,
    comments,
  } = req.body;

  try {
    // cloudinary setup
    const result = await cloudinary.uploader.upload(image, {
      folder: "products",
      width: 1200,
      crop: "scale",
    });

    const product = await Product.create({
      title,
      content,
      price,
      brand,
      
      postedBy: req.user._id,
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
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      title,
      content,
      price,
      brand,
      
      image,
    } = req.body;
    const currentProduct = await Product.findById(req.params.id);

    //build the object data
    const data = {
      title: title || currentProduct.title,
      content: content || currentProduct.content,
      price: price || currentProduct.price,
      brand: brand || currentProduct.brand,
      
      image: image || currentProduct.image,
    };

    //modify product image conditionally
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
      totalProducts
    });
  } catch (error) {
    console.error(error);
    next(new ErrorResponse("Failed to load products", 500));
  }
};
