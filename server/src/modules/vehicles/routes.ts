// Vehicles module
//
// Customer-owned vehicle management routes.

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import vehiclesController from './controller.js';
import { validateCreateVehicle, validateUpdateVehicle } from './validation.js';

const router = Router();

router.use(authenticate, authorize(UserRole.CUSTOMER));

router.post('/', validateCreateVehicle, vehiclesController.createVehicle);
router.get('/', vehiclesController.listVehicles);
router.get('/:vehicleId', vehiclesController.getVehicle);
router.patch('/:vehicleId', validateUpdateVehicle, vehiclesController.updateVehicle);
router.delete('/:vehicleId', vehiclesController.deleteVehicle);

export default router;
