const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRegister } = require('../middlewares/validationMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { verifyToken } = require('../middlewares/authMiddleware'); // ⬅️ Import middleware

router.post('/register', validateRegister, registerUser);
router.post('/login', loginLimiter, loginUser);

// ✅ Add validation route
router.get('/validate', verifyToken, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

module.exports = router;