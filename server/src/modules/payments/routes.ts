// Payments module
//
// Payment initiation/finalization, webhooks, payment records, supplier earnings, and refunds.

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import paymentsController from './controller.js';
import refundController from './refund.controller.js';
import settlementController from './settlement.controller.js';

const router = Router();

// Provider callback endpoint - signature verified, replay/dedupe protected, idempotent
router.post('/webhooks/:provider', paymentsController.handleWebhook);

router.use(authenticate);

router.post('/bookings/:bookingId/initiate', authorize(UserRole.CUSTOMER), paymentsController.initiatePayment);
router.post('/bookings/:bookingId/success', authorize(UserRole.CUSTOMER), paymentsController.confirmPaymentSuccess);
router.post('/bookings/:bookingId/failure', authorize(UserRole.CUSTOMER), paymentsController.confirmPaymentFailure);

router.get('/earnings/me', authorize(UserRole.SUPPLIER), paymentsController.getSupplierEarnings);
router.get('/settlements/me', authorize(UserRole.SUPPLIER), settlementController.getMySettlements);
router.get('/settlements/balance/me', authorize(UserRole.SUPPLIER), settlementController.getMySettlementBalance);
router.get('/payouts/me', authorize(UserRole.SUPPLIER), settlementController.getMyPayouts);
router.get('/', authorize(UserRole.CUSTOMER), paymentsController.listPayments);

// Refunds (P0.3) - specific routes before /:paymentId
router.get('/refunds', authorize(UserRole.CUSTOMER, UserRole.ADMIN), refundController.listRefunds);
router.get('/refunds/:refundId', authorize(UserRole.CUSTOMER, UserRole.ADMIN), refundController.getRefund);
router.post('/:paymentId/refunds', authorize(UserRole.CUSTOMER, UserRole.ADMIN), refundController.requestRefund);
router.get('/:paymentId/refunds', authorize(UserRole.CUSTOMER, UserRole.ADMIN), refundController.listRefunds);

router.get('/:paymentId', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), paymentsController.getPayment);

export default router;