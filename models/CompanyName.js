import mongoose, { Schema } from 'mongoose';

const companyNameSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
}, { collection: 'market_details' }); // Explicitly specify the collection name

const CompanyName = mongoose.model('CompanyName', companyNameSchema);

export default CompanyName;