import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.CLIENT_URL) return callback(null, true);
      if (env.NODE_ENV !== 'production') return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsers (capture raw body for payment webhook signature verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    verify: (req: any, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  })
);
app.use(cookieParser());

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server (only in non-serverless environments like local dev or Render)
async function start(): Promise<void> {
  await connectDB();
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

// On Vercel (serverless), do NOT call app.listen().
// Vercel imports this file and uses the exported `app` directly.
// On local dev / Render, boot the server normally.
const isVercel = process.env.VERCEL === '1';

if (!isVercel && env.NODE_ENV !== 'test') {
  start().catch(console.error);
}

// For Vercel serverless: connect DB on first request via middleware
if (isVercel) {
  app.use(async (_req, _res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });
}

export default app;
