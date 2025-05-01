const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');

dotenv.config();

if (!process.env.JWT_SECRET) {
	throw new Error('Missing JWT_SECRET in .env');
}

const app = express();

app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

app.use((req, res, next) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!!!' });
});

module.exports = app;
