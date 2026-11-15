// Bookings module
//
// Booking routes for customers and suppliers.

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import bookingsController from './controller.js';
import { validateCreateBooking } from './validation.js';

const router = Router();

router.use(authenticate);

// Customer
router.post('/', authorize(UserRole.CUSTOMER), validateCreateBooking, bookingsController.createBooking);
router.post('/:bookingId/pay', authorize(UserRole.CUSTOMER), bookingsController.payBooking);

// Supplier
router.post('/:bookingId/accept', authorize(UserRole.SUPPLIER), bookingsController.acceptBooking);
router.post('/:bookingId/reject', authorize(UserRole.SUPPLIER), bookingsController.rejectBooking);
router.post('/:bookingId/start', authorize(UserRole.SUPPLIER), bookingsController.startBooking);
router.post('/:bookingId/complete', authorize(UserRole.SUPPLIER), bookingsController.completeBooking);

// Shared (role-specific behavior enforced in controller/service)
router.get('/', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), bookingsController.listBookings);
router.get('/:bookingId', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), bookingsController.getBooking);
router.post('/:bookingId/cancel', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), bookingsController.cancelBooking);
router.post('/:bookingId/expire', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER), bookingsController.expireBooking);

export default router;
