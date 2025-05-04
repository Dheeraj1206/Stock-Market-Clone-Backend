const mongoose = require('mongoose');
const MarketDetails = require('./models/CompanyName');
require('dotenv').config();

const dbUri =
	process.env.MONGO_URI || 'mongodb://localhost:27017/stock_market_website';

// Sample company data with sectors as top-level keys
const marketData = {
	Technology: [
		{ name: 'Apple', symbol: 'AAPL' },
		{ name: 'Microsoft', symbol: 'MSFT' },
		{ name: 'Alphabet', symbol: 'GOOGL' },
		{ name: 'Amazon', symbol: 'AMZN' },
		{ name: 'NVIDIA', symbol: 'NVDA' },
		{ name: 'Meta Platforms', symbol: 'META' },
		{ name: 'Tesla', symbol: 'TSLA' },
		{ name: 'Taiwan Semiconductor', symbol: 'TSM' },
		{ name: 'Salesforce', symbol: 'CRM' },
		{ name: 'Adobe', symbol: 'ADBE' },
	],
	Financials: [
		{ name: 'JPMorgan Chase', symbol: 'JPM' },
		{ name: 'Bank of America', symbol: 'BAC' },
		{ name: 'Wells Fargo', symbol: 'WFC' },
		{ name: 'Citigroup', symbol: 'C' },
		{ name: 'Morgan Stanley', symbol: 'MS' },
		{ name: 'Goldman Sachs', symbol: 'GS' },
		{ name: 'Visa', symbol: 'V' },
		{ name: 'Mastercard', symbol: 'MA' },
		{ name: 'American Express', symbol: 'AXP' },
		{ name: 'HDFC Bank', symbol: 'HDFCBANK.NS' },
	],
	Healthcare: [
		{ name: 'Johnson & Johnson', symbol: 'JNJ' },
		{ name: 'UnitedHealth', symbol: 'UNH' },
		{ name: 'Pfizer', symbol: 'PFE' },
		{ name: 'Merck', symbol: 'MRK' },
		{ name: 'AbbVie', symbol: 'ABBV' },
		{ name: 'Eli Lilly', symbol: 'LLY' },
		{ name: 'Thermo Fisher Scientific', symbol: 'TMO' },
		{ name: 'Abbott Laboratories', symbol: 'ABT' },
		{ name: 'Danaher', symbol: 'DHR' },
		{ name: 'Roche Holding', symbol: 'ROG.SW' },
	],
	'Consumer Discretionary': [
		{ name: 'Home Depot', symbol: 'HD' },
		{ name: 'Nike', symbol: 'NKE' },
		{ name: "McDonald's", symbol: 'MCD' },
		{ name: 'Starbucks', symbol: 'SBUX' },
		{ name: 'Target', symbol: 'TGT' },
		{ name: "Lowe's", symbol: 'LOW' },
		{ name: 'TJX Companies', symbol: 'TJX' },
		{ name: 'Booking Holdings', symbol: 'BKNG' },
		{ name: 'Marriott International', symbol: 'MAR' },
		{ name: 'Ross Stores', symbol: 'ROST' },
	],
	'Consumer Staples': [
		{ name: 'Walmart', symbol: 'WMT' },
		{ name: 'Procter & Gamble', symbol: 'PG' },
		{ name: 'Coca-Cola', symbol: 'KO' },
		{ name: 'PepsiCo', symbol: 'PEP' },
		{ name: 'Costco', symbol: 'COST' },
		{ name: 'Philip Morris', symbol: 'PM' },
		{ name: 'Mondelez International', symbol: 'MDLZ' },
		{ name: 'Colgate-Palmolive', symbol: 'CL' },
		{ name: 'Estee Lauder', symbol: 'EL' },
		{ name: 'Kimberly-Clark', symbol: 'KMB' },
	],
	Energy: [
		{ name: 'Exxon Mobil', symbol: 'XOM' },
		{ name: 'Chevron', symbol: 'CVX' },
		{ name: 'ConocoPhillips', symbol: 'COP' },
		{ name: 'Shell', symbol: 'SHEL' },
		{ name: 'BP', symbol: 'BP' },
		{ name: 'TotalEnergies', symbol: 'TTE' },
		{ name: 'EOG Resources', symbol: 'EOG' },
		{ name: 'Schlumberger', symbol: 'SLB' },
		{ name: 'Marathon Petroleum', symbol: 'MPC' },
		{ name: 'Occidental Petroleum', symbol: 'OXY' },
	],
	Industrials: [
		{ name: 'Boeing', symbol: 'BA' },
		{ name: 'Caterpillar', symbol: 'CAT' },
		{ name: 'General Electric', symbol: 'GE' },
		{ name: 'Honeywell', symbol: 'HON' },
		{ name: '3M', symbol: 'MMM' },
		{ name: 'Deere & Company', symbol: 'DE' },
		{ name: 'Union Pacific', symbol: 'UNP' },
		{ name: 'Lockheed Martin', symbol: 'LMT' },
		{ name: 'General Dynamics', symbol: 'GD' },
		{ name: 'Raytheon Technologies', symbol: 'RTX' },
	],
	Materials: [
		{ name: 'Dow', symbol: 'DOW' },
		{ name: 'Newmont', symbol: 'NEM' },
		{ name: 'Linde', symbol: 'LIN' },
		{ name: 'Freeport-McMoRan', symbol: 'FCX' },
		{ name: 'Air Products', symbol: 'APD' },
		{ name: 'Sherwin-Williams', symbol: 'SHW' },
		{ name: 'Nucor', symbol: 'NUE' },
		{ name: 'International Paper', symbol: 'IP' },
		{ name: 'Ecolab', symbol: 'ECL' },
		{ name: 'Ball Corporation', symbol: 'BALL' },
	],
	Utilities: [
		{ name: 'NextEra Energy', symbol: 'NEE' },
		{ name: 'Duke Energy', symbol: 'DUK' },
		{ name: 'Southern Company', symbol: 'SO' },
		{ name: 'Dominion Energy', symbol: 'D' },
		{ name: 'American Electric Power', symbol: 'AEP' },
		{ name: 'Exelon', symbol: 'EXC' },
		{ name: 'Sempra Energy', symbol: 'SRE' },
		{ name: 'Consolidated Edison', symbol: 'ED' },
		{ name: 'Xcel Energy', symbol: 'XEL' },
		{ name: 'Public Service Enterprise Group', symbol: 'PEG' },
	],
	'Real Estate': [
		{ name: 'American Tower', symbol: 'AMT' },
		{ name: 'Prologis', symbol: 'PLD' },
		{ name: 'Crown Castle', symbol: 'CCI' },
		{ name: 'Equinix', symbol: 'EQIX' },
		{ name: 'Public Storage', symbol: 'PSA' },
		{ name: 'Digital Realty Trust', symbol: 'DLR' },
		{ name: 'Simon Property Group', symbol: 'SPG' },
		{ name: 'Welltower', symbol: 'WELL' },
		{ name: 'Realty Income', symbol: 'O' },
		{ name: 'AvalonBay Communities', symbol: 'AVB' },
	],
	'US Indices': [
		{ name: 'S&P 500', symbol: '^GSPC' },
		{ name: 'Dow Jones', symbol: '^DJI' },
		{ name: 'Nasdaq', symbol: '^IXIC' },
		{ name: 'Russell 2000', symbol: '^RUT' },
		{ name: 'VIX', symbol: '^VIX' },
		{ name: 'NYSE Composite', symbol: '^NYA' },
		{ name: 'Wilshire 5000', symbol: '^W5000' },
		{ name: 'S&P 100', symbol: '^OEX' },
		{ name: 'Nasdaq 100', symbol: '^NDX' },
		{ name: 'Dow Jones Transportation', symbol: '^DJT' },
	],
};

// Connect to MongoDB
mongoose
	.connect(dbUri)
	.then(async () => {
		console.log('Connected to MongoDB');

		// Check if data already exists
		const count = await MarketDetails.countDocuments();
		if (count > 0) {
			console.log(`Database already has data. Skipping seed.`);
			mongoose.disconnect();
			return;
		}

		// Insert sample data
		try {
			await MarketDetails.create(marketData);
			console.log(`Successfully seeded database with market data`);
		} catch (error) {
			console.error('Error seeding database:', error);
		} finally {
			mongoose.disconnect();
			console.log('Disconnected from MongoDB');
		}
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err);
	});
