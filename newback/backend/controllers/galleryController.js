const cloudinary = require('../utils/cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const main = require('../app');
const Gallery = require('../models/galleryModel');

//create item
exports.createGallery = async (req, res, next) => {
    const { title, content, postedBy, image, likes, comments } = req.body;

    try {
        //upload image in cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: "surgical",
            width: 1200,
            crop: "scale"
        })
        const gallery = await Gallery.create({
            title,
            content,

            postedBy: req.user._id,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            },

        });
        res.status(201).json({
            success: true,
            gallery
        })


    } catch (error) {
        console.log(error);
        next(error);
    }

}


//show galleries
exports.showGallery = async (req, res, next) => {
    try {
        const galleries = await Gallery.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.status(201).json({
            success: true,
            galleries
        })
    } catch (error) {
        next(error);
    }

}


//show single gallery
exports.showSingleGallery = async (req, res, next) => {
    try {
        const gallery = await Gallery.findById(req.params.id).populate('comments.postedBy', 'name');
        res.status(200).json({
            success: true,
            gallery
        })
    } catch (error) {
        next(error);
    }

}


//delete item
exports.deleteGallery = async (req, res, next) => {
    const currentGallery = await Gallery.findById(req.params.id);

    //delete gallery image in cloudinary       
    const ImgId = currentGallery.image.public_id;
    if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
    }

    try {
        const gallery = await Gallery.findByIdAndRemove(req.params.id);
        res.status(200).json({
            success: true,
            message: "Image deleted"
        })

    } catch (error) {
        next(error);
    }

}


//update gallery
exports.updateGallery = async (req, res, next) => {
    try {
        const { title, content, image } = req.body;
        const currentGallery = await Gallery.findById(req.params.id);

        //build the object data
        const data = {
            title: title || currentGallery.title,
            content: content || currentGallery.content,
            image: image || currentGallery.image,
        }

        //modify gallery image conditionally
        if (req.body.image !== '') {

            const ImgId = currentGallery.image.public_id;
            if (ImgId) {
                await cloudinary.uploader.destroy(ImgId);
            }

            const newImage = await cloudinary.uploader.upload(req.body.image, {
                folder: 'Gallery',
                width: 1200,
                crop: "scale"
            });

            data.image = {
                public_id: newImage.public_id,
                url: newImage.secure_url
            }

        }

        const galleryUpdate = await Gallery.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            galleryUpdate
        })

    } catch (error) {
        next(error);
    }

}

  