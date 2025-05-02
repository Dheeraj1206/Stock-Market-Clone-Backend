require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  port: process.env.SERVER_PORT || 5000,
  databaseUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET, //  No default, we check for it.
  // Add other configuration variables as needed
};