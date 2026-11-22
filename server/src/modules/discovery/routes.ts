import { Router } from 'express';
import discoveryController from './controller.js';

const router = Router();

// Public read-only discovery for landing page and authenticated customer flows.
router.get('/stations', discoveryController.searchStations);
router.get('/', discoveryController.searchStations);

export default router;
