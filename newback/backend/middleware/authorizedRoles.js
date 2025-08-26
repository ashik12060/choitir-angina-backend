// middleware/authorizeRoles.js
const ErrorResponse = require('../utils/errorResponse');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Access denied: ${req.user.role} is not authorized`, 403)
      );
    }
    next();
  };
};

module.exports = authorizeRoles;
