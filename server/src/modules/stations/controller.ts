// Stations module
//
// HTTP handlers for supplier-owned station management.

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { stationService } from './service.js';
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

export async function createStation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const station = await stationService.createStation(userId, req.body);
    res.status(201).json({ success: true, message: 'Station created successfully', data: { station } });
  } catch (error) {
    next(error);
  }
}

export async function listStations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const stations = await stationService.listStations(userId);
    res.json({ success: true, message: 'Stations retrieved successfully', data: { stations } });
  } catch (error) {
    next(error);
  }
}

export async function getStation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const station = await stationService.getStation(userId, req.params.stationId as string);
    res.json({ success: true, message: 'Station retrieved successfully', data: { station } });
  } catch (error) {
    next(error);
  }
}

export async function updateStation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const station = await stationService.updateStation(userId, req.params.stationId as string, req.body);
    res.json({ success: true, message: 'Station updated successfully', data: { station } });
  } catch (error) {
    next(error);
  }
}

export async function deleteStation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    await stationService.deleteStation(userId, req.params.stationId as string);
    res.json({ success: true, message: 'Station deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export const stationsController = {
  createStation,
  listStations,
  getStation,
  updateStation,
  deleteStation,
};

export default stationsController;
