import type { Request, Response, NextFunction } from 'express';
import { notificationService } from './service.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const notifications = await notificationService.listForUser(userId);
    res.json({ success: true, message: 'Notifications retrieved successfully', data: { notifications } });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    const notification = await notificationService.markRead(userId, req.params.notificationId as string);
    res.json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).userId as string;
    await notificationService.markAllRead(userId);
    res.json({ success: true, message: 'Notifications marked as read', data: {} });
  } catch (error) {
    next(error);
  }
}

export const notificationsController = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

export default notificationsController;
