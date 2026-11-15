// Bookings module
//
// HTTP handlers for booking workflows (customer and supplier).

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { bookingService } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

function handleValidationError(req: Request): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const first = result.array()[0];
    const message =
      first && 'msg' in first && typeof first.msg === 'string'
        ? first.msg
        : 'Validation failed';
    throw new AppError(message, 400);
  }
}

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const booking = await bookingService.createBooking(userId, req.body);
    res.status(201).json({ success: true, message: 'Booking created successfully', data: { booking } });
  } catch (error) {
    next(error);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const role = authReq.user?.role;
    const bookings =
      role === 'SUPPLIER'
        ? await bookingService.listSupplierBookings(userId)
        : await bookingService.listCustomerBookings(userId);
    res.json({ success: true, message: 'Bookings retrieved successfully', data: { bookings } });
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const role = authReq.user?.role;
    const bookingId = req.params.bookingId as string;
    const booking =
      role === 'SUPPLIER'
        ? await bookingService.getSupplierBooking(userId, bookingId)
        : await bookingService.getCustomerBooking(userId, bookingId);
    res.json({ success: true, message: 'Booking retrieved successfully', data: { booking } });
  } catch (error) {
    next(error);
  }
}

async function transition(req: Request, res: Response, next: NextFunction, action: 'accept' | 'reject' | 'pay' | 'cancel' | 'expire' | 'start' | 'complete'): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const role = (authReq.user?.role === 'SUPPLIER' ? 'SUPPLIER' : 'CUSTOMER') as 'CUSTOMER' | 'SUPPLIER';
    const booking = await bookingService.transitionBooking(req.params.bookingId as string, { role, userId }, action);
    res.json({ success: true, message: 'Booking updated successfully', data: { booking } });
  } catch (error) {
    next(error);
  }
}

export const acceptBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'accept');
export const rejectBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'reject');
export const payBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'pay');
export const cancelBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'cancel');
export const expireBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'expire');
export const startBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'start');
export const completeBooking = (req: Request, res: Response, next: NextFunction) => transition(req, res, next, 'complete');

export const bookingsController = {
  createBooking,
  listBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  payBooking,
  cancelBooking,
  expireBooking,
  startBooking,
  completeBooking,
};

export default bookingsController;
