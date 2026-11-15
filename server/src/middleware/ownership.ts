// Ownership middleware
//
// Phase 2: resource ownership checks for customer-owned and
// supplier-owned records.

import type { Request, Response, NextFunction } from 'express';
import { Vehicle } from '../modules/vehicles/model.js';
import { Booking } from '../modules/bookings/model.js';
import { Station } from '../modules/stations/model.js';
import { Terminal } from '../modules/terminals/model.js';
import { SupplierProfile } from '../modules/auth/model.js';
import { AppError } from './errorHandler.js';

function getUserId(req: { userId?: string }): string {
  if (!req.userId) {
    throw new AppError('Authentication required', 401);
  }
  return req.userId;
}

export async function authorizeCustomerVehicle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req as { userId?: string });
    const vehicle = await Vehicle.findById(req.params.vehicleId).exec();
    if (!vehicle) {
      next(new AppError('Vehicle not found', 404));
      return;
    }
    if (vehicle.customerId.toString() !== userId) {
      next(new AppError('Forbidden: vehicle access denied', 403));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function authorizeCustomerBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req as { userId?: string });
    const booking = await Booking.findById(req.params.bookingId).exec();
    if (!booking) {
      next(new AppError('Booking not found', 404));
      return;
    }
    if (booking.customerId.toString() !== userId) {
      next(new AppError('Forbidden: booking access denied', 403));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function authorizeSupplierStation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req as { userId?: string });
    const station = await Station.findById(req.params.stationId).exec();
    if (!station) {
      next(new AppError('Station not found', 404));
      return;
    }
    const supplierProfile = await SupplierProfile.findById(station.supplierId).exec();
    if (!supplierProfile || supplierProfile.user.toString() !== userId) {
      next(new AppError('Forbidden: station access denied', 403));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function authorizeSupplierTerminal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req as { userId?: string });
    const terminal = await Terminal.findById(req.params.terminalId).exec();
    if (!terminal) {
      next(new AppError('Terminal not found', 404));
      return;
    }
    const station = await Station.findById(terminal.stationId).exec();
    if (!station) {
      next(new AppError('Station not found', 404));
      return;
    }
    const supplierProfile = await SupplierProfile.findById(station.supplierId).exec();
    if (!supplierProfile || supplierProfile.user.toString() !== userId) {
      next(new AppError('Forbidden: terminal access denied', 403));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
