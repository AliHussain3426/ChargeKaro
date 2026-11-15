import type { Request, Response, NextFunction } from 'express';
import { settlementService } from './settlement.service.js';
import { PayoutStatus } from './payout.model.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

export async function getMySettlements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const settlements = await settlementService.listForSupplierUser(authReq.userId as string);
    res.json({ success: true, message: 'Settlements retrieved successfully', data: { settlements } });
  } catch (error) { next(error); }
}

export async function getMySettlementBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const balance = await settlementService.getSupplierBalance(authReq.userId as string);
    res.json({ success: true, message: 'Settlement balance retrieved successfully', data: { balance } });
  } catch (error) { next(error); }
}

export async function getMyPayouts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const payouts = await settlementService.supplierListPayouts(authReq.userId as string);
    res.json({ success: true, message: 'Payouts retrieved successfully', data: { payouts } });
  } catch (error) { next(error); }
}

export async function adminListSettlements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settlements = await settlementService.adminListSettlements();
    res.json({ success: true, message: 'Settlements retrieved successfully', data: { settlements } });
  } catch (error) { next(error); }
}

export async function adminGetSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settlement = await settlementService.adminGetSettlement(req.params.settlementId as string);
    res.json({ success: true, message: 'Settlement retrieved successfully', data: { settlement } });
  } catch (error) { next(error); }
}

export async function adminReconcileSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settlements = await settlementService.reconcileForSupplier(req.params.supplierId as string);
    res.json({ success: true, message: 'Settlement reconciliation completed', data: { settlements } });
  } catch (error) { next(error); }
}

export async function adminApproveSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const settlement = await settlementService.adminApproveSettlement(
      req.params.settlementId as string,
      authReq.userId as string,
      req.body?.note as string | undefined
    );
    res.json({ success: true, message: 'Settlement approved', data: { settlement } });
  } catch (error) { next(error); }
}

export async function adminCreatePayout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const payout = await settlementService.adminCreatePayout(
      req.params.supplierId as string,
      authReq.userId as string,
      Array.isArray(req.body?.settlementIds) ? req.body.settlementIds : undefined
    );
    res.json({ success: true, message: 'Payout record created (manual/internal processing; no bank transfer executed)', data: { payout } });
  } catch (error) { next(error); }
}

export async function adminListPayouts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payouts = await settlementService.adminListPayouts(req.query.supplierId as string | undefined);
    res.json({ success: true, message: 'Payouts retrieved successfully', data: { payouts } });
  } catch (error) { next(error); }
}

export async function adminUpdatePayoutStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const status = req.body?.status as PayoutStatus;
    const payout = await settlementService.adminUpdatePayoutStatus(
      req.params.payoutId as string,
      authReq.userId as string,
      status,
      req.body?.note as string | undefined
    );
    res.json({ success: true, message: 'Payout status updated', data: { payout } });
  } catch (error) { next(error); }
}

export default {
  getMySettlements,
  getMySettlementBalance,
  getMyPayouts,
  adminListSettlements,
  adminGetSettlement,
  adminReconcileSupplier,
  adminApproveSettlement,
  adminCreatePayout,
  adminListPayouts,
  adminUpdatePayoutStatus,
};