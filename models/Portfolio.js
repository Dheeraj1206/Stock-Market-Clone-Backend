const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
	symbol: {
		type: String,
		required: true,
		trim: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 0,
	},
	averageBuyPrice: {
		type: Number,
		required: true,
		min: 0,
	},
	transactions: [
		{
			type: String,
			enum: ['BUY', 'SELL'],
			default: 'BUY',
		},
	],
	purchaseDate: {
		type: Date,
		default: Date.now,
	},
});

const PortfolioSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	holdings: [PortfolioItemSchema],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Pre-save middleware to update the updatedAt field
PortfolioSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
