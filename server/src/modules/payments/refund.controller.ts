import type { Request, Response, NextFunction } from 'express';
import { refundService } from './refund.service.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

export async function requestRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const actor = { userId: authReq.userId as string, role: authReq.user?.role as string };
    const refund = await refundService.requestRefund(actor, req.params.paymentId as string, {
      amount: req.body?.amount != null ? Number(req.body.amount) : undefined,
      reason: String(req.body?.reason ?? ''),
      idempotencyKey: req.body?.idempotencyKey as string | undefined,
    });
    const statusCode = refund.status === 'SUCCEEDED' ? 200 : refund.status === 'PROCESSING' || refund.status === 'REQUESTED' ? 202 : 200;
    res.status(statusCode).json({ success: true, message: 'Refund processed', data: { refund } });
  } catch (error) {
    next(error);
  }
}

export async function listRefunds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const actor = { userId: authReq.userId as string, role: authReq.user?.role as string };
    const paymentId = (req.params.paymentId as string | undefined) || (req.query.paymentId as string | undefined);
    const refunds = await refundService.listRefunds(actor, paymentId);
    res.json({ success: true, message: 'Refunds retrieved successfully', data: { refunds } });
  } catch (error) {
    next(error);
  }
}

export async function getRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const actor = { userId: authReq.userId as string, role: authReq.user?.role as string };
    const refund = await refundService.getRefund(actor, req.params.refundId as string);
    res.json({ success: true, message: 'Refund retrieved successfully', data: { refund } });
  } catch (error) {
    next(error);
  }
}

export const refundController = {
  requestRefund,
  listRefunds,
  getRefund,
};

export default refundController;