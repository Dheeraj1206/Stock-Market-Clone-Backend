const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateRegister };
