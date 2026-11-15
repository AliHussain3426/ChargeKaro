import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import notificationsController from './controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.listNotifications);
router.post('/read-all', notificationsController.markAllNotificationsRead);
router.post('/:notificationId/read', notificationsController.markNotificationRead);

export default router;
