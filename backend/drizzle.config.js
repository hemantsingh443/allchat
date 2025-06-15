// backend/drizzle.config.js
import 'dotenv/config';

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql', // Specify the dialect explicitly
  dbCredentials: {
    url: process.env.DATABASE_URL, // Use 'url' instead of 'connectionString'
  },
};