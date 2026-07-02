const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

// Strip any HTML tags from string values to prevent XSS
function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace(/<[^>]*>/g, '')  // strip HTML tags
        .trim();
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
}

function validate(req, res, next) {
  // Sanitize body, query, and params
  sanitizeInput(req.body);
  sanitizeInput(req.query);
  sanitizeInput(req.params);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 422, 'Validation failed', errors.array());
  }
  next();
}

module.exports = validate;