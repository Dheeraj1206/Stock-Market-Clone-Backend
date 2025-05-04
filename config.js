require('dotenv').config();

module.exports = {
  port: process.env.SERVER_PORT || 5000,
  databaseUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};