const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

if (!process.env.JWT_SECRET) {
	throw new Error('Missing JWT_Secret in .env');
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.use((req, res, next) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!!!' });
});

module.exports = app;
