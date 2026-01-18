const logAudit = async (req, res, next) => {
  try {
    // Store original json and send methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Capture response status
    let statusCode = res.statusCode;
    let responseBody = null;

    // Override json method
    res.json = function(data) {
      statusCode = res.statusCode;
      responseBody = data;
      return originalJson.call(this, data);
    };

    // Override send method
    res.send = function(data) {
      statusCode = res.statusCode;
      responseBody = data;
      return originalSend.call(this, data);
    };

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Audit logging error:', error);
    next();
  }
};

module.exports = logAudit;
