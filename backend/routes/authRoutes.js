const express = require('express');
const router = express.Router();
const { signup, signin, logout, userProfile, getAllUsers, googleLogin } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { getAuth } = require('firebase-admin/auth')

//auth routes
router.post('/signup', signup);

router.post('/signin', signin);

router.get('/logout', logout);

router.get('/me', isAuthenticated, userProfile);

router.get('/users', getAllUsers);

router.post('/google-login', async (req, res) => {
    const { token } = req.body;
  
    if (!token) {
      return res.status(400).json({ message: 'Token is missing' });
    }
  
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      // Perform additional logic, e.g., create/update user in your database
      const userId = decodedToken.uid;
      // Generate your own JWT or session token here if needed
      const yourJwtToken = '...';
  
      res.json({ token: yourJwtToken });
    } catch (error) {
      console.error('Error verifying token', error);
      res.status(400).json({ message: 'Invalid token' });
    }
  });


module.exports = router;