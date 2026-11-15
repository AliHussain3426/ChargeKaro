// Vehicles module
//
// Request validation for customer-owned vehicle management.

import { body } from 'express-validator';
import { VehicleCategory } from '../../types/index.js';

const vehicleCategoryValues = Object.values(VehicleCategory);

export const validateCreateVehicle = [
  body('manufacturer').exists().isString().trim().isLength({ min: 1, max: 80 }),
  body('model').exists().isString().trim().isLength({ min: 1, max: 80 }),
  body('vehicleCategory').exists().isIn(vehicleCategoryValues),
  body('modelYear').optional().isInt({ min: 1980, max: 2100 }).toInt(),
  body('batteryCapacityKwh').optional().isFloat({ min: 0 }).toFloat(),
  body('connectorTypes').optional().isArray(),
  body('connectorTypes.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('maximumChargingPowerKw').optional().isFloat({ min: 0 }).toFloat(),
];

export const validateUpdateVehicle = [
  body('manufacturer').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('model').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('vehicleCategory').optional().isIn(vehicleCategoryValues),
  body('modelYear').optional().isInt({ min: 1980, max: 2100 }).toInt(),
  body('batteryCapacityKwh').optional().isFloat({ min: 0 }).toFloat(),
  body('connectorTypes').optional().isArray(),
  body('connectorTypes.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('maximumChargingPowerKw').optional().isFloat({ min: 0 }).toFloat(),
];
