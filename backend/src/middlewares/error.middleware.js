const { error } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return error(res, statusCode, message, err.errors || null);
}

module.exports = errorMiddleware;