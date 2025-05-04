const Portfolio = require('../models/Portfolio');
const stockService = require('../services/stockService');

class PortfolioController {
	// Get user's portfolio
	async getPortfolio(req, res) {
		try {
			const userId = req.user.id;

			// Find portfolio, create one if it doesn't exist
			let portfolio = await Portfolio.findOne({ user: userId });

			if (!portfolio) {
				portfolio = new Portfolio({ user: userId, holdings: [] });
				await portfolio.save();
			}

			// Get current prices for all holdings
			if (portfolio.holdings.length > 0) {
				const symbols = portfolio.holdings.map((item) => item.symbol);
				const prices = await stockService.getMultipleStockPrices(symbols);

				// Combine holdings with current prices
				const holdingsWithPrices = portfolio.holdings.map((holding) => {
					const stockData = prices.find((p) => p.symbol === holding.symbol) || {
						currentPrice: 0,
						percentChange: 0,
					};

					const currentValue = holding.quantity * stockData.currentPrice;
					const investedValue = holding.quantity * holding.averageBuyPrice;
					const profitLoss = currentValue - investedValue;
					const profitLossPercentage =
						investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

					return {
						...holding.toObject(),
						currentPrice: stockData.currentPrice,
						currentValue,
						investedValue,
						profitLoss,
						profitLossPercentage,
						percentChange: stockData.percentChange,
					};
				});

				// Calculate portfolio total values
				const totalCurrentValue = holdingsWithPrices.reduce(
					(sum, item) => sum + item.currentValue,
					0
				);
				const totalInvestedValue = holdingsWithPrices.reduce(
					(sum, item) => sum + item.investedValue,
					0
				);
				const totalProfitLoss = totalCurrentValue - totalInvestedValue;
				const totalProfitLossPercentage =
					totalInvestedValue > 0
						? (totalProfitLoss / totalInvestedValue) * 100
						: 0;

				return res.json({
					holdings: holdingsWithPrices,
					summary: {
						totalCurrentValue,
						totalInvestedValue,
						totalProfitLoss,
						totalProfitLossPercentage,
					},
				});
			}

			return res.json({
				holdings: [],
				summary: {
					totalCurrentValue: 0,
					totalInvestedValue: 0,
					totalProfitLoss: 0,
					totalProfitLossPercentage: 0,
				},
			});
		} catch (error) {
			console.error('Portfolio fetch error:', error);
			res.status(500).json({ error: error.message });
		}
	}

	// Add a stock to portfolio
	async addStock(req, res) {
		try {
			const userId = req.user.id;
			const { symbol, quantity, buyPrice } = req.body;

			if (!symbol || !quantity || !buyPrice) {
				return res
					.status(400)
					.json({ error: 'Symbol, quantity and buy price are required' });
			}

			if (quantity <= 0 || buyPrice <= 0) {
				return res
					.status(400)
					.json({ error: 'Quantity and buy price must be positive values' });
			}

			// Validate symbol exists
			try {
				await stockService.getStockPrice(symbol);
			} catch (error) {
				return res.status(400).json({ error: 'Invalid stock symbol' });
			}

			// Find or create portfolio
			let portfolio = await Portfolio.findOne({ user: userId });
			if (!portfolio) {
				portfolio = new Portfolio({ user: userId, holdings: [] });
			}

			// Check if stock already exists in portfolio
			const existingHolding = portfolio.holdings.find(
				(h) => h.symbol === symbol
			);

			if (existingHolding) {
				// Update existing holding with new average price
				const totalShares = existingHolding.quantity + quantity;
				const totalCost =
					existingHolding.quantity * existingHolding.averageBuyPrice +
					quantity * buyPrice;
				const newAveragePrice = totalCost / totalShares;

				existingHolding.quantity = totalShares;
				existingHolding.averageBuyPrice = newAveragePrice;
				existingHolding.transactions.push('BUY');
			} else {
				// Add new holding
				portfolio.holdings.push({
					symbol,
					quantity,
					averageBuyPrice: buyPrice,
					transactions: ['BUY'],
				});
			}

			await portfolio.save();
			res.status(201).json({ message: 'Stock added to portfolio', portfolio });
		} catch (error) {
			console.error('Add stock error:', error);
			res.status(500).json({ error: error.message });
		}
	}

	// Update a stock in portfolio
	async updateStock(req, res) {
		try {
			const userId = req.user.id;
			const { symbol } = req.params;
			const { quantity, buyPrice } = req.body;

			if (!quantity || quantity <= 0) {
				return res.status(400).json({ error: 'Valid quantity is required' });
			}

			// Find portfolio
			const portfolio = await Portfolio.findOne({ user: userId });
			if (!portfolio) {
				return res.status(404).json({ error: 'Portfolio not found' });
			}

			// Find the holding
			const holdingIndex = portfolio.holdings.findIndex(
				(h) => h.symbol === symbol
			);
			if (holdingIndex === -1) {
				return res.status(404).json({ error: 'Stock not found in portfolio' });
			}

			// Update holding
			portfolio.holdings[holdingIndex].quantity = quantity;
			if (buyPrice && buyPrice > 0) {
				portfolio.holdings[holdingIndex].averageBuyPrice = buyPrice;
			}

			await portfolio.save();
			res.json({ message: 'Stock updated in portfolio', portfolio });
		} catch (error) {
			console.error('Update stock error:', error);
			res.status(500).json({ error: error.message });
		}
	}

	// Remove a stock from portfolio
	async removeStock(req, res) {
		try {
			const userId = req.user.id;
			const { symbol } = req.params;

			// Find portfolio
			const portfolio = await Portfolio.findOne({ user: userId });
			if (!portfolio) {
				return res.status(404).json({ error: 'Portfolio not found' });
			}

			// Remove the holding
			portfolio.holdings = portfolio.holdings.filter(
				(h) => h.symbol !== symbol
			);

			await portfolio.save();
			res.json({ message: 'Stock removed from portfolio', portfolio });
		} catch (error) {
			console.error('Remove stock error:', error);
			res.status(500).json({ error: error.message });
		}
	}

	// Get portfolio performance
	async getPerformance(req, res) {
		try {
			const userId = req.user.id;

			// Find portfolio
			const portfolio = await Portfolio.findOne({ user: userId });
			if (!portfolio || portfolio.holdings.length === 0) {
				return res.json({
					performance: [],
					overall: {
						totalReturn: 0,
						totalReturnPercentage: 0,
					},
				});
			}

			// Get current prices
			const symbols = portfolio.holdings.map((item) => item.symbol);
			const prices = await stockService.getMultipleStockPrices(symbols);

			// Calculate performance for each holding
			const performance = portfolio.holdings.map((holding) => {
				const stockData = prices.find((p) => p.symbol === holding.symbol) || {
					currentPrice: 0,
					percentChange: 0,
				};

				const currentValue = holding.quantity * stockData.currentPrice;
				const investedValue = holding.quantity * holding.averageBuyPrice;
				const profitLoss = currentValue - investedValue;
				const profitLossPercentage =
					investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

				return {
					symbol: holding.symbol,
					quantity: holding.quantity,
					averageBuyPrice: holding.averageBuyPrice,
					currentPrice: stockData.currentPrice,
					currentValue,
					investedValue,
					profitLoss,
					profitLossPercentage,
					dailyChange: stockData.percentChange,
				};
			});

			// Calculate overall performance
			const totalCurrentValue = performance.reduce(
				(sum, item) => sum + item.currentValue,
				0
			);
			const totalInvestedValue = performance.reduce(
				(sum, item) => sum + item.investedValue,
				0
			);
			const totalReturn = totalCurrentValue - totalInvestedValue;
			const totalReturnPercentage =
				totalInvestedValue > 0 ? (totalReturn / totalInvestedValue) * 100 : 0;

			res.json({
				performance,
				overall: {
					totalCurrentValue,
					totalInvestedValue,
					totalReturn,
					totalReturnPercentage,
				},
			});
		} catch (error) {
			console.error('Performance calculation error:', error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new PortfolioController();
