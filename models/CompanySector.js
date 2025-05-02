const mongoose = require('mongoose');

const companySectorSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		sector: {
			type: String,
			required: true,
			unique: true,
		},
		symbols: {
			type: [String],
			default: [],
		},
	},
	{ collection: 'market_details' }
);

const CompanySector = mongoose.model('CompanySector', companySectorSchema);

module.exports = CompanySector;
