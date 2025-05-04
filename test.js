const axios = require('axios');

async function testAPI() {
	try {
		console.log('Making request to marketdata.py API...');
		const response = await axios.get('http://localhost:5000/stock_data', {
			params: {
				ticker: 'RELIANCE.NS',
				period: '1d',
				interval: '1d',
			},
			timeout: 10000, // 10 second timeout
		});

		if (response.data && response.data.length > 0) {
			console.log(
				'Success! First data point:',
				JSON.stringify(response.data[0], null, 2)
			);
			console.log(`Total data points: ${response.data.length}`);
		} else {
			console.log('No data received');
		}
	} catch (error) {
		console.error('Error:', error.response?.data || error.message);
	}
}

console.log('Starting API test...');
testAPI();
