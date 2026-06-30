const { verifyAccessToken } = require('../utils/jwt.utils');
const { error } = require('../utils/apiResponse');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return error(res, 401, 'Invalid or expired token');
  }
}

module.exports = authMiddleware;