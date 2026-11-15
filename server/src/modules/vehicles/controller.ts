// Vehicles module
//
// HTTP handlers for customer-owned vehicle management.

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { vehicleService } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
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

export async function createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const vehicle = await vehicleService.createVehicle(userId, req.body);
    res.status(201).json({ success: true, message: 'Vehicle created successfully', data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function listVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const vehicles = await vehicleService.listVehicles(userId);
    res.json({ success: true, message: 'Vehicles retrieved successfully', data: { vehicles } });
  } catch (error) {
    next(error);
  }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const vehicle = await vehicleService.getVehicle(userId, req.params.vehicleId as string);
    res.json({ success: true, message: 'Vehicle retrieved successfully', data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const vehicle = await vehicleService.updateVehicle(userId, req.params.vehicleId as string, req.body);
    res.json({ success: true, message: 'Vehicle updated successfully', data: { vehicle } });
  } catch (error) {
    next(error);
  }
}

export async function deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    await vehicleService.deleteVehicle(userId, req.params.vehicleId as string);
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export const vehiclesController = {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};

export default vehiclesController;
