// Checks for dangerous SQL injection patterns in a string
function containsSqlInjection(str) {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
  return sqlPattern.test(str);
}

// Checks for XSS patterns in a string
function containsXss(str) {
  const xssPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  return xssPattern.test(str);
}

// Middleware that scans all request body fields for threats
function securityScan(req, res, next) {
  const body = JSON.stringify(req.body || {});
  const query = JSON.stringify(req.query || {});

  if (containsSqlInjection(body) || containsSqlInjection(query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
    });
  }

  if (containsXss(body) || containsXss(query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
    });
  }

  next();
}

module.exports = { securityScan, containsSqlInjection, containsXss };