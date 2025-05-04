const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { verifyToken } = require('../middlewares/authMiddleware');

// All portfolio routes require authentication
router.use(verifyToken);

// Get user's portfolio
router.get('/', portfolioController.getPortfolio);

// Add a stock to portfolio
router.post('/add', portfolioController.addStock);

// Update a stock in portfolio
router.put('/update/:symbol', portfolioController.updateStock);

// Remove a stock from portfolio
router.delete('/remove/:symbol', portfolioController.removeStock);

// Get portfolio performance
router.get('/performance', portfolioController.getPerformance);

module.exports = router;
