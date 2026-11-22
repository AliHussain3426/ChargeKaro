import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import notificationsController from './controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.listNotifications);
router.post('/', authorize(UserRole.ADMIN), notificationsController.createNotification);
router.post('/read-all', notificationsController.markAllNotificationsRead);
router.post('/:notificationId/read', notificationsController.markNotificationRead);
router.delete('/:notificationId', notificationsController.deleteNotification);

export default router;
