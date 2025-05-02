const CompanyName = require('../models/CompanyName');
const StockSector = require('../models/CompanySector');
const StockData = require('../models/StockDataModel');
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

  async getStockSector() {
    try {
      const marketDetails = await StockData.findOne({});
      if (marketDetails) {
        const sectors = Object.keys(marketDetails.toObject()).filter(
          (key) => key !== '_id'
        );
        return sectors;
      }
      return [];
    } catch (error) {
      throw new Error(`Failed to fetch company sectors: ${error.message}`);
    }
  }
  async getStockName(companyNameToFind) {
    try {
      const marketDetails = await StockData.findOne({}); // Fetch the single document

      if (!marketDetails) {
        return []; // Return empty array if no data is found
      }

      const companySymbols = [];
      const marketDetailsObject = marketDetails.toObject();

      // Iterate through each sector in the document
      for (const sector in marketDetailsObject) {
        if (sector !== '_id') {
          const companies = marketDetailsObject[sector];
          if (Array.isArray(companies)) {
            // Iterate through the companies in the current sector
            for (const company of companies) {
              if (company.name === companyNameToFind) {
                companySymbols.push(company.symbol);
              }
            }
          }
        }
      }

      return companySymbols;
    } catch (error) {
      throw new Error(`Failed to fetch company names: ${error.message}`);
    }
  }
}

module.exports = new StockService();