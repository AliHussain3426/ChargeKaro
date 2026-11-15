import { Router } from 'express';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);

// Future route registrations:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/stations', stationRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/terminals', terminalRoutes);
// router.use('/admin', adminRoutes);

export default router;
