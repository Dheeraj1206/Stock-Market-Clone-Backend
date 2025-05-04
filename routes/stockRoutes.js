const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/price/:symbol', stockController.getStockPrice);
router.post('/prices', stockController.getMultipleStockPrices);
router.get('/search', stockController.searchStocks);
router.get('/sector', stockController.getStockSector);
router.get('/sector/:name', stockController.getStockName);
router.get('/profile/:symbol', stockController.getCompanyProfile);
router.get('/historical/:symbol', stockController.getHistoricalData);
router.get('/market/sectors', stockController.getAllSectorsWithStocks);

module.exports = router;
