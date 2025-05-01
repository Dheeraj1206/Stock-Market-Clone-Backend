const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/price/:symbol', stockController.getStockPrice);
router.post('/prices', stockController.getMultipleStockPrices);
router.get('/search', stockController.searchStocks);
router.get('/profile/:symbol', stockController.getCompanyProfile);

module.exports = router;
