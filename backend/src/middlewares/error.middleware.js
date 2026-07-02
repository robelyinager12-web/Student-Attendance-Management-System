const { error } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log the full error in dev, minimal info in production
  if (isDev) {
    console.error(err.stack);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return error(res, 409, 'A record with this value already exists');
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return error(res, 422, 'Validation error', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 401, 'Token has expired');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 400, 'File size too large. Maximum allowed is 2MB');
  }

  return error(
    res,
    statusCode,
    isDev ? err.message : 'Something went wrong'
  );
}

module.exports = errorMiddleware;