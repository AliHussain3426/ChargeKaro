import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import adminController from './controller.js';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.listUsers);
router.patch('/users/:userId', adminController.updateUser);

router.get('/suppliers', adminController.listSuppliers);
router.patch('/suppliers/:supplierId', adminController.updateSupplier);

router.get('/stations', adminController.listStations);
router.get('/terminals', adminController.listTerminals);
router.get('/bookings', adminController.listBookings);

router.get('/reports', adminController.getReports);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
