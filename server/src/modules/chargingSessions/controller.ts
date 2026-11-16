import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { chargingSessionService } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

function handleValidationError(req: Request): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const first = result.array()[0];
    const message = first && 'msg' in first && typeof first.msg === 'string' ? first.msg : 'Validation failed';
    throw new AppError(message, 400);
  }
}

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const session = await chargingSessionService.startSession((req as AuthenticatedRequest).userId as string, req.body);
    res.status(201).json({ success: true, message: 'Charging session started', data: { session } });
  } catch (error) { next(error); }
}

export async function completeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    handleValidationError(req);
    const session = await chargingSessionService.completeSession(
      (req as AuthenticatedRequest).userId as string,
      req.params.sessionId as string,
      req.body
    );
    res.json({ success: true, message: 'Charging session completed', data: { session } });
  } catch (error) { next(error); }
}

export async function listSupplierSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await chargingSessionService.listSessionsForSupplier(
      (req as AuthenticatedRequest).userId as string,
      { status: req.query.status as string | undefined, bookingId: req.query.bookingId as string | undefined }
    );
    res.json({ success: true, message: 'Charging sessions retrieved successfully', data: { sessions } });
  } catch (error) { next(error); }
}

export async function getSupplierSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await chargingSessionService.getSessionForSupplier(
      (req as AuthenticatedRequest).userId as string,
      req.params.sessionId as string
    );
    res.json({ success: true, message: 'Charging session retrieved successfully', data: { session } });
  } catch (error) { next(error); }
}

export async function listCustomerSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessions = await chargingSessionService.listSessionsForCustomer((req as AuthenticatedRequest).userId as string);
    res.json({ success: true, message: 'Charging sessions retrieved successfully', data: { sessions } });
  } catch (error) { next(error); }
}

export async function getCustomerSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await chargingSessionService.getSessionForCustomer(
      (req as AuthenticatedRequest).userId as string,
      req.params.sessionId as string
    );
    res.json({ success: true, message: 'Charging session retrieved successfully', data: { session } });
  } catch (error) { next(error); }
}

export async function getSessionReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const receipt = await chargingSessionService.getReceipt(req.params.sessionId as string, {
      userId: authReq.userId as string,
      role: authReq.user?.role ?? '',
    });
    res.json({ success: true, message: 'Receipt retrieved successfully', data: { receipt } });
  } catch (error) { next(error); }
}

export const chargingSessionsController = {
  startSession,
  completeSession,
  listSupplierSessions,
  getSupplierSession,
  listCustomerSessions,
  getCustomerSession,
  getSessionReceipt,
};

export default chargingSessionsController;
