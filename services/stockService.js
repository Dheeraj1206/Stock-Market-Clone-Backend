const axios = require('axios');
require('dotenv').config();

class StockService {
	constructor() {
		this.finnhubClient = axios.create({
			baseURL: 'https://finnhub.io/api/v1',
			headers: {
				'X-Finnhub-Token': process.env.FINNHUB_API_KEY,
			},
		});
	}

	async getStockPrice(symbol) {
		try {
			const response = await this.finnhubClient.get(`/quote?symbol=${symbol}`);
			return {
				symbol: symbol,
				currentPrice: response.data.c,
				change: response.data.d,
				percentChange: response.data.dp,
				highPrice: response.data.h,
				lowPrice: response.data.l,
				openPrice: response.data.o,
				previousClose: response.data.pc,
				timestamp: response.data.t,
			};
		} catch (error) {
			throw new Error(`Failed to fetch stock price: ${error.message}`);
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
			const response = await this.finnhubClient.get(`/search?q=${query}`);
			return response.data.result;
		} catch (error) {
			throw new Error(`Failed to search stocks: ${error.message}`);
		}
	}

	async getCompanyProfile(symbol) {
		try {
			const response = await this.finnhubClient.get(
				`/stock/profile2?symbol=${symbol}`
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to fetch company profile: ${error.message}`);
		}
	}
}

module.exports = new StockService();
