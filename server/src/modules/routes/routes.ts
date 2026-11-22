import { Router } from 'express';
import routesController from './controller.js';

const router = Router();

// Public read-only routing for landing page previews and authenticated customer flows.
router.get('/', routesController.getRoute);
router.get('/directions', routesController.getRoute);

export default router;
