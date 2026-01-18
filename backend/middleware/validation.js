const { body, validationResult } = require('express-validator');

const validateInput = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    next();
  };
};

const sanitizeInput = (field) => {
  return body(field)
    .trim()
    .escape()
    .notEmpty()
    .withMessage(`${field} is required`);
};

module.exports = { validateInput, sanitizeInput };
