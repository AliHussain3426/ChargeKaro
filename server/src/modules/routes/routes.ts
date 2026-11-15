import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import routesController from './controller.js';

const router = Router();

router.use(authenticate);
router.get('/', routesController.getRoute);
router.get('/directions', routesController.getRoute);

export default router;
