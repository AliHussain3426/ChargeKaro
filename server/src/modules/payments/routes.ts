// Payments module
//
// Payment initiation/finalization, webhooks, payment records, and supplier earnings.

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import paymentsController from './controller.js';

const router = Router();

// Webhook-ready endpoint (provider callbacks) - typically verified by signature in production
router.post('/webhooks/:provider', paymentsController.handleWebhook);

router.use(authenticate);

router.post('/bookings/:bookingId/initiate', authorize(UserRole.CUSTOMER), paymentsController.initiatePayment);
router.post('/bookings/:bookingId/success', authorize(UserRole.CUSTOMER), paymentsController.confirmPaymentSuccess);
router.post('/bookings/:bookingId/failure', authorize(UserRole.CUSTOMER), paymentsController.confirmPaymentFailure);

router.get('/earnings/me', authorize(UserRole.SUPPLIER), paymentsController.getSupplierEarnings);
router.get('/', authorize(UserRole.CUSTOMER), paymentsController.listPayments);
router.get('/:paymentId', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), paymentsController.getPayment);

export default router;
