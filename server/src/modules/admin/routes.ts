import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import adminController from './controller.js';
import settlementController from '../payments/settlement.controller.js';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.listUsers);
router.patch('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

router.get('/suppliers', adminController.listSuppliers);
router.patch('/suppliers/:supplierId', adminController.updateSupplier);

router.get('/stations', adminController.listStations);
router.patch('/stations/:stationId', adminController.updateStation);
router.delete('/stations/:stationId', adminController.deleteStation);
router.get('/terminals', adminController.listTerminals);
router.get('/bookings', adminController.listBookings);

router.get('/reports', adminController.getReports);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// P0.4 settlements & payouts (admin oversight; no fake bank-transfer completion)
router.get('/settlements', settlementController.adminListSettlements);
router.get('/settlements/:settlementId', settlementController.adminGetSettlement);
router.post('/settlements/suppliers/:supplierId/reconcile', settlementController.adminReconcileSupplier);
router.post('/settlements/:settlementId/approve', settlementController.adminApproveSettlement);
router.get('/payouts', settlementController.adminListPayouts);
router.post('/payouts/suppliers/:supplierId', settlementController.adminCreatePayout);
router.patch('/payouts/:payoutId/status', settlementController.adminUpdatePayoutStatus);

export default router;
