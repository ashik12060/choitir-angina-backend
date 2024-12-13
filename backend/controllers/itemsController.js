const cloudinary = require('../utils/cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const main = require('../app');
const Item = require('../models/itemModel');

//create item
exports.createItem = async (req, res, next) => {
    const { title, content, postedBy, image, likes, comments } = req.body;

    try {
        //upload image in cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: "surgical",
            width: 1200,
            crop: "scale"
        })
        const item = await Item.create({
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
            item
        })


    } catch (error) {
        console.log(error);
        next(error);
    }

}


//show items
exports.showItem = async (req, res, next) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.status(201).json({
            success: true,
            items
        })
    } catch (error) {
        next(error);
    }

}


//show single item
exports.showSingleItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id).populate('comments.postedBy', 'name');
        res.status(200).json({
            success: true,
            item
        })
    } catch (error) {
        next(error);
    }

}


//delete item
exports.deleteItem = async (req, res, next) => {
    const currentItem = await Item.findById(req.params.id);

    //delete item image in cloudinary       
    const ImgId = currentItem.image.public_id;
    if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
    }

    try {
        const item = await Item.findByIdAndRemove(req.params.id);
        res.status(200).json({
            success: true,
            message: "item deleted"
        })

    } catch (error) {
        next(error);
    }

}


//update item
exports.updateItem = async (req, res, next) => {
    try {
        const { title, content, image } = req.body;
        const currentItem = await Item.findById(req.params.id);

        //build the object data
        const data = {
            title: title || currentItem.title,
            content: content || currentItem.content,
            image: image || currentItem.image,
        }

        //modify item image conditionally
        if (req.body.image !== '') {

            const ImgId = currentItem.image.public_id;
            if (ImgId) {
                await cloudinary.uploader.destroy(ImgId);
            }

            const newImage = await cloudinary.uploader.upload(req.body.image, {
                folder: 'items',
                width: 1200,
                crop: "scale"
            });

            data.image = {
                public_id: newImage.public_id,
                url: newImage.secure_url
            }

        }

        const itemUpdate = await Item.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            itemUpdate
        })

    } catch (error) {
        next(error);
    }

}

  