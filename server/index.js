const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');

const env = require('./config/env');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const seoRoutes = require('./routes/seoRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { UPLOAD_DIR } = require('./utils/upload');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = env.clientUrl.split(',').map((s) => s.trim()).filter(Boolean);
const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
app.use(
  cors({
    // Listed origins always pass; outside production any localhost port is accepted too,
    // so a dev server that lands on 3001 instead of 3000 still works.
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || (!env.isProduction && isLocalOrigin(origin))),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024, fieldSize: 2 * 1024 * 1024 },
    abortOnLimit: true,
    // Same { message } shape as every other error, so the client can show it.
    responseOnLimit: JSON.stringify({ message: 'That file is too large. Images must be 2 MB or smaller.' }),
  }),
);

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '7d',
    immutable: true,
    // Seeded covers keep a fixed name (seed-<slug>.jpg) and may be replaced, so let browsers revalidate them daily.
    setHeaders: (res, filePath) => {
      if (require('path').basename(filePath).startsWith('seed-')) res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  }),
);

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use(seoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB(env.mongoUri)
  .then((conn) => {
    console.log(`MongoDB connected: ${conn.host}/${conn.name}`);
    const server = app.listen(env.port, env.host, () => console.log(`Safin API listening on http://${env.host}:${env.port}`));

    // systemd sends SIGTERM on stop/restart: finish in-flight requests, then close the database connection.
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down…`);
      server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
