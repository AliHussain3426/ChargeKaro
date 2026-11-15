// Payments module
//
// HTTP handlers for payment initiation, finalization (stub/webhook-ready),
// and supplier earnings.

import type { Request, Response, NextFunction } from 'express';
import { paymentService } from './service.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

export async function initiatePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { payment, booking } = await paymentService.initiatePayment(
      authReq.userId as string,
      req.params.bookingId as string,
      { idempotencyKey: (req.body?.idempotencyKey as string | undefined) }
    );
    res.json({ success: true, message: 'Payment initiated', data: { payment, booking } });
  } catch (error) {
    next(error);
  }
}

export async function confirmPaymentSuccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { payment, booking } = await paymentService.finalizeSuccess({
      bookingId: req.params.bookingId as string,
      providerReference: req.body?.providerReference as string | undefined,
    });
    res.json({ success: true, message: 'Payment completed successfully', data: { payment, booking } });
  } catch (error) {
    next(error);
  }
}

export async function confirmPaymentFailure(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { payment, booking } = await paymentService.finalizeFailure({
      bookingId: req.params.bookingId as string,
      providerReference: req.body?.providerReference as string | undefined,
      reason: req.body?.reason as string | undefined,
    });
    res.json({ success: true, message: 'Payment failed', data: { payment, booking } });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const provider = (req.params.provider as string) || 'stub';
    const result = await paymentService.handleWebhook(provider, req.body ?? {});
    res.json({ success: true, message: 'Webhook processed', data: result });
  } catch (error) {
    next(error);
  }
}

export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const payments = await paymentService.listPaymentsForCustomer(authReq.userId as string);
    res.json({ success: true, message: 'Payments retrieved successfully', data: { payments } });
  } catch (error) {
    next(error);
  }
}

export async function getPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const payment = await paymentService.getPayment(
      authReq.userId as string,
      authReq.user?.role ?? 'CUSTOMER',
      req.params.paymentId as string
    );
    res.json({ success: true, message: 'Payment retrieved successfully', data: { payment } });
  } catch (error) {
    next(error);
  }
}

export async function getSupplierEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const earnings = await paymentService.getSupplierEarnings(authReq.userId as string);
    res.json({ success: true, message: 'Earnings retrieved successfully', data: { earnings } });
  } catch (error) {
    next(error);
  }
}

export const paymentsController = {
  initiatePayment,
  confirmPaymentSuccess,
  confirmPaymentFailure,
  handleWebhook,
  listPayments,
  getPayment,
  getSupplierEarnings,
};

export default paymentsController;
