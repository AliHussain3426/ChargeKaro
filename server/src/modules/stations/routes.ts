// Stations module
//
// Supplier-owned station management routes.

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { authorizeSupplierStation } from '../../middleware/ownership.js';
import { UserRole } from '../../types/index.js';
import stationsController from './controller.js';
import { validateCreateStation, validateUpdateStation } from './validation.js';
import terminalRoutes from '../terminals/routes.js';

const router = Router();

router.use(authenticate, authorize(UserRole.SUPPLIER));

router.post('/', validateCreateStation, stationsController.createStation);
router.get('/', stationsController.listStations);
router.get('/:stationId', authorizeSupplierStation, stationsController.getStation);
router.patch('/:stationId', authorizeSupplierStation, validateUpdateStation, stationsController.updateStation);
router.delete('/:stationId', authorizeSupplierStation, stationsController.deleteStation);

// Nested terminal routes: /api/stations/:stationId/terminals
router.use('/:stationId/terminals', authorizeSupplierStation, terminalRoutes);

export default router;
