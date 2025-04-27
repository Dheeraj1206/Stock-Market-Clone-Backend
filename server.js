const { default: mongoose } = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.server_PORT || 3000;

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.error('MongoDB connection error:', err));

app
	.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	})
	.on('error', (err) => {
		console.log('Server failed to start: ', err);
	});
