
const User = require('../models/userModel');
const ErrorResponse = require('../utils/errorResponse');
const admin = require('../config/firebaseAdmin');

exports.signup = async (req, res, next) => {
    const { email } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
        return next(new ErrorResponse("E-mail already registered", 400));
    }
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        next(error);
    }
}


exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email) {
            return next(new ErrorResponse("please add an email", 403));
        }
        if (!password) {
            return next(new ErrorResponse("please add a password", 403));
        }

        //check user email
        const user = await User.findOne({ email });
        if (!user) {
            return next(new ErrorResponse("invalid credentials", 400));
        }
        //check password
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorResponse("invalid credentials", 400));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
}

const sendTokenResponse = async (user, codeStatus, res) => {
    const token = await user.getJwtToken();
    const options = { maxAge: 60 * 60 * 1000, httpOnly: true }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res
        .status(codeStatus)
        .cookie('token', token, options)
        .json({
            success: true,
            id: user._id,
            role: user.role,
            token
        })
}

//logout
exports.logout = (req, res, next) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "logged out"
    })
}


//user profile
exports.userProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
        success: true,
        user
    })
}
// get all users
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({role: 'user'}, { password: 0 }); // Exclude password field from the result
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  

// Google sign-in
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { email, name, picture, uid } = decodedToken;
  
      // Check if user exists
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({ email, name, picture, googleId: uid });
        await user.save();
      }
  
      // Create JWT token
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      res.status(200).json({ token: jwtToken, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid token', error });
    }
  };