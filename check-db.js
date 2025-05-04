const mongoose = require('mongoose');
const MarketDetails = require('./models/CompanyName');
require('dotenv').config();

const dbUri =
	process.env.MONGO_URI || 'mongodb://localhost:27017/stock_market_website';

// Connect to MongoDB
mongoose
	.connect(dbUri)
	.then(async () => {
		console.log('Connected to MongoDB');

		try {
			// Check if data exists
			const count = await MarketDetails.countDocuments();
			console.log(`Found ${count} document(s) in the MarketDetails collection`);

			if (count > 0) {
				// Fetch all documents - each document is a sector
				const sectors = await MarketDetails.find({});

				console.log('\nSectors in the database:');
				console.log('=======================');

				// Log each sector with a number
				sectors.forEach((sector, index) => {
					const sectorData = sector.toObject();
					const sectorName = sectorData.category;
					const stocks = sectorData.stocks || [];

					if (Array.isArray(stocks)) {
						console.log(`${index + 1}. ${sectorName}: ${stocks.length} stocks`);

						// Print the first 3 stocks for each sector
						console.log('   Sample stocks:');
						stocks.slice(0, 3).forEach((stock) => {
							console.log(`   - ${stock.name} (${stock.symbol})`);
						});
						console.log('');
					} else {
						console.log(
							`${index + 1}. ${sectorName}: Invalid data format - not an array`
						);
					}
				});
			} else {
				console.log('No data found in the MarketDetails collection');
			}
		} catch (error) {
			console.error('Error checking database:', error);
		} finally {
			mongoose.disconnect();
			console.log('\nDisconnected from MongoDB');
		}
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err);
	});
