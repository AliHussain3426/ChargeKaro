import type { Request, Response, NextFunction } from 'express';
import { notificationService } from './service.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: { role?: string };
}

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const isAdmin = authReq.user?.role === 'ADMIN';
    const notifications = await notificationService.listForUser(userId, { isAdmin });
    res.json({ success: true, message: 'Notifications retrieved successfully', data: { notifications } });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const isAdmin = authReq.user?.role === 'ADMIN';
    const notification = await notificationService.markRead(userId, req.params.notificationId as string, { isAdmin });
    res.json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const isAdmin = authReq.user?.role === 'ADMIN';
    await notificationService.markAllRead(userId, { isAdmin });
    res.json({ success: true, message: 'Notifications marked as read', data: {} });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId as string;
    const isAdmin = authReq.user?.role === 'ADMIN';
    await notificationService.delete(userId, req.params.notificationId as string, { isAdmin });
    res.json({ success: true, message: 'Notification deleted', data: {} });
  } catch (error) {
    next(error);
  }
}

export async function createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { title?: string; message?: string; type?: string; targetRole?: 'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'ADMIN'; userId?: string };
    const result = await notificationService.createAdminNotification({
      title: body.title ?? '',
      message: body.message ?? '',
      type: body.type ?? 'ADMIN_MESSAGE',
      targetRole: body.targetRole ?? 'ALL',
      userId: body.userId,
    });
    res.status(201).json({ success: true, message: 'Notification created', data: result });
  } catch (error) {
    next(error);
  }
}

export const notificationsController = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
};

export default notificationsController;
