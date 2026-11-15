import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import discoveryController from './controller.js';

const router = Router();

router.use(authenticate);
router.get('/stations', discoveryController.searchStations);
router.get('/', discoveryController.searchStations);

export default router;
