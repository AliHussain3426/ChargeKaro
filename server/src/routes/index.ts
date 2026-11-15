import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from '../modules/auth/routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Future route registrations:
// router.use('/users', userRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/stations', stationRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/terminals', terminalRoutes);
// router.use('/admin', adminRoutes);

export default router;
