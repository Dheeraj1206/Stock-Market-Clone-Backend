const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define company schema for companies within sectors
const CompanySchema = new Schema({
	name: String,
	symbol: String
});

// Define dynamic schema for sectors
const MarketDetailsSchema = new Schema(
	{
		// Allow any field name (sector names) with array of company objects
	},
	{ 
		collection: 'market_details',
		strict: false // Allow any fields to be saved
	}
);

const MarketDetails = mongoose.model('MarketDetails', MarketDetailsSchema);

module.exports = MarketDetails;
