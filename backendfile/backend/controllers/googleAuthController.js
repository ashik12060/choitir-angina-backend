// const verifyIdToken = require('../utils/verifyToken');
// const User = require('../models/userModel');
// const ErrorResponse = require('../utils/errorResponse');

// exports.googleAuth = async (req, res, next) => {
//   const { idToken } = req.body;
//   try {
//     const userInfo = await verifyIdToken(idToken);
//     let user = await User.findOne({ email: userInfo.email });

//     if (!user) {
//       user = await User.create({
//         name: userInfo.name,
//         email: userInfo.email,
//         password: 'default_password', // or generate a random password
//         // you might want to avoid storing a default password and use different approach
//       });
//     }

//     const token = await user.getJwtToken();
//     const options = { maxAge: 60 * 60 * 1000, httpOnly: true };
//     if (process.env.NODE_ENV === 'production') {
//       options.secure = true;
//     }
//     res.status(200).cookie('token', token, options).json({
//       success: true,
//       id: user._id,
//       role: user.role,
//       token,
//     });
//   } catch (error) {
//     next(new ErrorResponse('Google authentication failed', 400));
//   }
// };
