const axios = require('axios');
require('dotenv').config();
const MarketDetails = require('../models/CompanyName');

class StockService {
	constructor() {
		this.stockApiClient = axios.create({
			baseURL: 'http://localhost:5001', // Flask API running on port 5001
			timeout: 10000, // 10 second timeout
		});
	}

	async getStockPrice(symbol) {
		try {
			// First try to get direct stock info (more reliable for current price)
			const infoResponse = await this.stockApiClient.get(`/debug/${symbol}`);

			if (
				infoResponse.data &&
				(infoResponse.data.currentPrice || infoResponse.data.regularMarketPrice)
			) {
				// Use the direct info which has more accurate real-time pricing
				const currentPrice =
					infoResponse.data.currentPrice ||
					infoResponse.data.regularMarketPrice;
				const previousClose = infoResponse.data.previousClose || 0;

				// Calculate change and percent change
				const change = (currentPrice - previousClose).toFixed(2);
				const percentChange = previousClose
					? (((currentPrice - previousClose) / previousClose) * 100).toFixed(2)
					: '0.00';

				return {
					symbol,
					currentPrice: currentPrice,
					change: change,
					percentChange: percentChange,
					highPrice:
						infoResponse.data.dayHigh ||
						infoResponse.data.regularMarketDayHigh ||
						0,
					lowPrice:
						infoResponse.data.dayLow ||
						infoResponse.data.regularMarketDayLow ||
						0,
					openPrice:
						infoResponse.data.open || infoResponse.data.regularMarketOpen || 0,
					previousClose: previousClose,
					volume: infoResponse.data.regularMarketVolume || 0,
					lastUpdated: new Date().toISOString(),
				};
			}

			// Fallback to historical data if direct info is not available
			const response = await this.stockApiClient.get('/stock_data', {
				params: {
					ticker: symbol,
					period: '1d',
					interval: '1d',
				},
			});

			if (!response.data || response.data.length === 0) {
				throw new Error(`No data found for symbol ${symbol}`);
			}

			// Get the latest stock data from the response
			const latestData = response.data[response.data.length - 1];
			const previousData =
				response.data[response.data.length - 2] || latestData;

			return {
				symbol,
				currentPrice: latestData.Close,
				change: (latestData.Close - previousData.Close).toFixed(2),
				percentChange: (
					((latestData.Close - previousData.Close) / previousData.Close) *
					100
				).toFixed(2),
				highPrice: latestData.High,
				lowPrice: latestData.Low,
				openPrice: latestData.Open,
				previousClose: previousData.Close,
				volume: latestData.Volume,
				lastUpdated: latestData.Converted_Date,
			};
		} catch (error) {
			if (error.response) {
				// Server responded with error
				throw new Error(error.response.data.message || 'Server error occurred');
			} else if (error.request) {
				// Request made but no response
				throw new Error('No response from stock data server');
			} else {
				// Other errors
				throw new Error(`Failed to fetch stock price: ${error.message}`);
			}
		}
	}

	async getHistoricalData(symbol, period = '1y', interval = '1d') {
		try {
			const response = await this.stockApiClient.get('/stock_data', {
				params: {
					ticker: symbol,
					period: period,
					interval: interval,
				},
			});

			return response.data.map((item) => ({
				timestamp: item.Converted_Date,
				open: item.Open,
				high: item.High,
				low: item.Low,
				close: item.Close,
				volume: item.Volume,
				date: new Date(item.Converted_Date).toLocaleDateString(),
				time: new Date(item.Converted_Date).toLocaleTimeString(),
			}));
		} catch (error) {
			throw new Error(`Failed to fetch historical data: ${error.message}`);
		}
	}

	async getMultipleStockPrices(symbols) {
		try {
			const promises = symbols.map((symbol) => this.getStockPrice(symbol));
			return await Promise.all(promises);
		} catch (error) {
			throw new Error(
				`Failed to fetch multiple stock prices: ${error.message}`
			);
		}
	}

	async searchStocks(query) {
		try {
			const response = await this.stockApiClient.get('/search', {
				params: {
					q: query,
				},
			});
			return response.data.result;
		} catch (error) {
			throw new Error(`Failed to search stocks: ${error.message}`);
		}
	}

	async getCompanyProfile(symbol) {
		try {
			// This would need to be implemented in MarketDtata.py
			// For now, we'll return basic data from a stock_data request
			const response = await this.stockApiClient.get('/stock_data', {
				params: {
					ticker: symbol,
					period: '1d',
					interval: '1d',
				},
			});

			if (!response.data || response.data.length === 0) {
				throw new Error(`No data found for symbol ${symbol}`);
			}

			// Create a simple profile from the available data
			return {
				symbol: symbol,
				name: symbol.split('.')[0],
				exchange: symbol.includes('.') ? symbol.split('.')[1] : 'Unknown',
				lastPrice: response.data[response.data.length - 1].Close,
			};
		} catch (error) {
			throw new Error(`Failed to fetch company profile: ${error.message}`);
		}
	}

	async getStockSector() {
		try {
			// Get all sectors from the database
			const marketDetails = await MarketDetails.findOne({});
			if (!marketDetails) {
				throw new Error('Market details not found in database');
			}

			// Get all keys except _id, these are the sectors
			const sectors = Object.keys(marketDetails.toObject()).filter(
				(key) => key !== '_id'
			);

			return sectors;
		} catch (error) {
			throw new Error(`Failed to fetch stock sectors: ${error.message}`);
		}
	}

	async getAllSectorsWithStocks() {
		try {
			// Get all sectors from the database
			const sectors = await MarketDetails.find({});
			if (!sectors || sectors.length === 0) {
				throw new Error('No sectors found in database');
			}

			return sectors;
		} catch (error) {
			throw new Error(`Failed to fetch sectors with stocks: ${error.message}`);
		}
	}

	async getStockName(companyNameToFind) {
		try {
			// For now, simply filter from a predefined list of companies
			// In a real implementation, this would query a database
			const companies = [
				{ name: 'Apple', symbol: 'AAPL' },
				{ name: 'Microsoft', symbol: 'MSFT' },
				{ name: 'Amazon', symbol: 'AMZN' },
				{ name: 'Google', symbol: 'GOOGL' },
				{ name: 'Facebook', symbol: 'META' },
				{ name: 'Tesla', symbol: 'TSLA' },
				{ name: 'Reliance Industries', symbol: 'RELIANCE.NS' },
				{ name: 'Tata Consultancy Services', symbol: 'TCS.NS' },
				{ name: 'Infosys', symbol: 'INFY.NS' },
				{ name: 'HDFC Bank', symbol: 'HDFCBANK.NS' },
			];

			// Filter companies by name
			const matches = companies
				.filter((company) =>
					company.name.toLowerCase().includes(companyNameToFind.toLowerCase())
				)
				.map((company) => company.symbol);

			return matches;
		} catch (error) {
			throw new Error(`Failed to fetch company names: ${error.message}`);
		}
	}
}

module.exports = new StockService();
