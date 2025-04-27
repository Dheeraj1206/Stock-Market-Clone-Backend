const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRegister } = require('../middlewares/validationMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/register', validateRegister, registerUser);
router.post('/login', loginLimiter, loginUser);

module.exports = router;
