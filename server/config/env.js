require('dotenv').config({ quiet: true });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}. See .env.example.`);
  process.exit(1);
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

module.exports = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || '0.0.0.0',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl,
  // Public address of the client, used for sitemap URLs. Defaults to the first CLIENT_URL origin.
  siteUrl: (process.env.SITE_URL || clientUrl.split(',')[0]).trim().replace(/\/+$/, ''),
  isProduction: process.env.NODE_ENV === 'production',
};
