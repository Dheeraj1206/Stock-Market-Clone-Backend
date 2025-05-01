const stockService = require('../services/stockService');

class StockController {
	async getStockPrice(req, res) {
		try {
			const { symbol } = req.params;
			const stockData = await stockService.getStockPrice(symbol);
			res.json(stockData);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async getMultipleStockPrices(req, res) {
		try {
			const { symbols } = req.body;
			const stocksData = await stockService.getMultipleStockPrices(symbols);
			res.json(stocksData);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async searchStocks(req, res) {
		try {
			const { query } = req.query;
			const results = await stockService.searchStocks(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async getCompanyProfile(req, res) {
		try {
			const { symbol } = req.params;
			const profile = await stockService.getCompanyProfile(symbol);
			res.json(profile);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new StockController();
