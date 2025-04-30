const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');

dotenv.config();

// Check required environment variables
if (!process.env.JWT_SECRET) {
	throw new Error('Missing JWT_SECRET in .env');
}

const app = express();

// CORS configuration
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true // Optional: Only needed if you use cookies or sessions
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/stocks', stockRoutes); // Assuming this is needed

// 404 handler
app.use((req, res, next) => {
	res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!!!' });
});

module.exports = app;
