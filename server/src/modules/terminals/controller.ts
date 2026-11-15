// Terminals module
//
// HTTP handlers for supplier-owned terminal management.

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { terminalService } from './service.js';
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

export async function createTerminal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const stationId = req.params.stationId as string;
    const terminal = await terminalService.createTerminal(userId, stationId, req.body);
    res.status(201).json({ success: true, message: 'Terminal created successfully', data: { terminal } });
  } catch (error) {
    next(error);
  }
}

export async function listTerminals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const stationId = req.params.stationId as string;
    const terminals = await terminalService.listTerminals(userId, stationId);
    res.json({ success: true, message: 'Terminals retrieved successfully', data: { terminals } });
  } catch (error) {
    next(error);
  }
}

export async function updateTerminal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const terminalId = req.params.terminalId as string;
    const terminal = await terminalService.updateTerminal(userId, terminalId, req.body);
    res.json({ success: true, message: 'Terminal updated successfully', data: { terminal } });
  } catch (error) {
    next(error);
  }
}

export async function updateTerminalStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedRequest).userId as string;
    const terminalId = req.params.terminalId as string;
    const terminal = await terminalService.updateTerminalStatus(userId, terminalId, req.body);
    res.json({ success: true, message: 'Terminal status updated successfully', data: { terminal } });
  } catch (error) {
    next(error);
  }
}

export async function deleteTerminal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const terminalId = req.params.terminalId as string;
    await terminalService.deleteTerminal(userId, terminalId);
    res.json({ success: true, message: 'Terminal deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export const terminalsController = {
  createTerminal,
  listTerminals,
  updateTerminal,
  updateTerminalStatus,
  deleteTerminal,
};

export default terminalsController;
