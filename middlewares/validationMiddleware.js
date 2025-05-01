const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('name').notEmpty().withMessage('Name is required'),  // Ensure name is not empty
  check('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('phone').notEmpty().withMessage('Phone number is required'),  // Ensure phone is not empty
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateRegister };
