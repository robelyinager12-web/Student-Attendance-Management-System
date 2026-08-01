const { error } = require('../utils/apiResponse');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, 403, 'Access denied: insufficient permissions');
    }
    next();
  };
}

module.exports = authorize;