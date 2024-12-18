const cloudinary = require("../utils/cloudinary");
// const Product = require("../models/");
const TopBanner = require("../models/TopBannerModel")
const ErrorResponse = require("../utils/errorResponse");
const main = require("../app");


//create product
exports.createTopBanner = async (req, res, next) => {
  const {
    title,
    postedBy,
    image,
  } = req.body;

  try {
    // cloudinary setup
    const result = await cloudinary.uploader.upload(image, {
      folder: "Top Banner",
      width: 1200,
      crop: "scale",
    });

    const topBanner = await TopBanner.create({
      title,
    
      postedBy: req.user._id,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      topBanner,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// single product
exports.showTopBanner = async (req, res, next) => {
  try {
    const topBanners = await TopBanner.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    res.status(201).json({
      success: true,
      topBanners,
    });
  } catch (error) {
    next(error);
  }
};

// single product
exports.showSingleTopBanner = async (req, res, next) => {
  try {
    const topBanner = await TopBanner.findById(req.params.id).populate(
      "comments.postedBy",
      "name"
    );
    res.status(200).json({
      success: true,
      topBanner,
    });
  } catch (error) {
    next(error);
  }
};
 


// Delete showTopBanner
exports.deleteTopBanner = async (req, res, next) => {
  const currentTopBanner = await TopBanner.findById(req.params.id);

  //delete post image in cloudinary
  const ImgId = currentTopBanner.image.public_id;
  if (ImgId) {
    await cloudinary.uploader.destroy(ImgId);
  }

  try {
    const topBanner = await TopBanner.findByIdAndRemove(req.params.id);
    res.status(200).json({
      success: true,
      message: "TopBanner deleted",
    });
  } catch (error) {
    next(error);
  }
};

// update TopBanner
exports.updateTopBanner = async (req, res, next) => {
  try {
    const {
      title, 
      image,
    } = req.body;
    const currentTopBanner = await TopBanner.findById(req.params.id);

    //build the object data
    const data = {
      title: title || currentTopBanner.title,
      
      
      image: image || currentTopBanner.image,
    };

    //modify currentTopBanner image conditionally
    if (req.body.image !== "") {
      const ImgId = currentTopBanner.image.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const newImage = await cloudinary.uploader.upload(req.body.image, {
        folder: "Top Banner",
        width: 1200,
        crop: "scale",
      });

      data.image = {
        public_id: newImage.public_id,
        url: newImage.secure_url,
      };
    }

    const TopBannerUpdate = await TopBanner.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      TopBannerUpdate,
    });
  } catch (error) {
    next(error);
  }
};


