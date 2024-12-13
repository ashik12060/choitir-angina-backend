// // middleware/auth.js
// const admin = require('firebase-admin');
// const Seller = require('../models/sellerModel');

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

// const verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     const seller = await Seller.findOne({ phoneNumber: decodedToken.phone_number });
//     if (!seller) return res.status(401).json({ message: 'Unauthorized' });

//     req.seller = seller;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// module.exports = verifyToken;

// middleware/auth.js
const admin = require('firebase-admin');
const Seller = require('../models/sellerModel');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// const verifyToken = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     const seller = await Seller.findOne({ phoneNumber: decodedToken.phone_number });
//     if (!seller) return res.status(401).json({ message: 'Unauthorized' });

//     req.seller = seller;
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify token with Firebase Admin SDK
    console.log('Decoded Token:', decodedToken); // Debugging purpose
    const seller = await Seller.findOne({ phoneNumber: decodedToken.phone_number });
    if (!seller) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};


module.exports = verifyToken;
