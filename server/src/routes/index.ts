import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from '../modules/auth/routes.js';
import stationRoutes from '../modules/stations/routes.js';
import terminalDirectRoutes from '../modules/terminals/routes.js';
import vehicleRoutes from '../modules/vehicles/routes.js';
import bookingRoutes from '../modules/bookings/routes.js';
import discoveryRoutes from '../modules/discovery/routes.js';
import routingRoutes from '../modules/routes/routes.js';
import paymentRoutes from '../modules/payments/routes.js';
import notificationRoutes from '../modules/notifications/routes.js';
import adminRoutes from '../modules/admin/routes.js';
import chargingSessionRoutes from '../modules/chargingSessions/routes.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/stations', stationRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/routes', routingRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/charging-sessions', chargingSessionRoutes);

// Direct terminal operations (ownership enforced per terminal)
router.use(
  '/terminals',
  authenticate,
  authorize(UserRole.SUPPLIER),
  terminalDirectRoutes
);

// Note: /terminals/:terminalId ownership is validated in service for update/delete;
// for read-like direct ops we rely on service checks. Add ownership middleware on
// specific routes if needed in future.

// Future route registrations:
// router.use('/users', userRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/admin', adminRoutes);

export default router;
