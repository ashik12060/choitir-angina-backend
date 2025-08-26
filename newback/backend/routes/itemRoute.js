const express = require('express');
const router = express.Router();
// const { createPost, showPost, showSinglePost, deletePost, updatePost, addLike, removeLike, addComment, deleteComment,  } = require('../controllers/postController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { showItem, showSingleItem, deleteItem, updateItem, createItem } = require('../controllers/itemsController');


//blog routes
router.post('/item/create', isAuthenticated, isAdmin, createItem);
router.get('/items/show', showItem);
router.get('/item/:id', showSingleItem);
router.delete('/delete/item/:id', isAuthenticated, isAdmin, deleteItem);
router.put('/update/item/:id', isAuthenticated, isAdmin, updateItem);
// router.put('/comment/item/:id', isAuthenticated, addComment);
// router.put('/addlike/itme/:id', isAuthenticated, addLike);
// router.put('/removelike/item/:id', isAuthenticated, removeLike);


module.exports = router;