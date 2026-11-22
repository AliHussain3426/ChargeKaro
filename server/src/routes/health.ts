import { Router, type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const router = Router();

/**
 * GET /api/health
 *
 * Reports API liveness and MongoDB connectivity.
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      res.status(503).json({
        success: false,
        message: 'EV Charging Platform API is running but MongoDB is not connected',
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        database: {
          status: 'disconnected',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'EV Charging Platform API is running',
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: 'connected',
        host: mongoose.connection.host,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
