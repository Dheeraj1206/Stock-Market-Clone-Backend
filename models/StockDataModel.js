// In stockDataModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
  name: String,
  symbol: String,
});

const stockDataSchema = new Schema({
  _id: Schema.Types.ObjectId,
  'Technology': [companySchema],
  'Consumer Discretionary': [companySchema],
  'Consumer Staples': [companySchema],
  'Energy': [companySchema],
  'Financials': [companySchema],
  'Healthcare': [companySchema],
  'Industrials': [companySchema],
  'Materials': [companySchema],
  'Real Estate': [companySchema],
  'US Indices': [companySchema],
  'Utilities': [companySchema],
});

const StockData = mongoose.model('StockData', stockDataSchema, 'market_details'); // Explicitly use 'market_details' collection

module.exports = StockData;