// Stations module
//
// Request validation for supplier-owned station management.

import { body } from 'express-validator';
import { PricingType } from '../../types/index.js';

const pricingTypeValues = Object.values(PricingType);

export const validateCreateStation = [
  body('name').exists().isString().trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('address').exists().isString().trim().isLength({ min: 3, max: 240 }),
  body('city').optional().isString().trim().isLength({ max: 120 }),
  body('province').optional().isString().trim().isLength({ max: 120 }),
  body('country').optional().isString().trim().isLength({ max: 120 }),
  body('location.coordinates').exists().isArray({ min: 2, max: 2 }),
  body('location.coordinates.0').exists().isFloat({ min: -180, max: 180 }).toFloat(),
  body('location.coordinates.1').exists().isFloat({ min: -90, max: 90 }).toFloat(),
  body('pricing.amount').exists().isFloat({ min: 0 }).toFloat(),
  body('pricing.currency').optional().isString().trim().isLength({ min: 3, max: 6 }),
  body('pricing.billingType').optional().isIn(pricingTypeValues),
  body('operatingHours.opensAt').exists().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('operatingHours.closesAt').exists().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('operatingHours.timezone').optional().isString().trim().isLength({ max: 80 }),
];

export const validateUpdateStation = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('address').optional().isString().trim().isLength({ min: 3, max: 240 }),
  body('city').optional().isString().trim().isLength({ max: 120 }),
  body('province').optional().isString().trim().isLength({ max: 120 }),
  body('country').optional().isString().trim().isLength({ max: 120 }),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }),
  body('location.coordinates.0').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  body('location.coordinates.1').optional().isFloat({ min: -90, max: 90 }).toFloat(),
  body('pricing.amount').optional().isFloat({ min: 0 }).toFloat(),
  body('pricing.currency').optional().isString().trim().isLength({ min: 3, max: 6 }),
  body('pricing.billingType').optional().isIn(pricingTypeValues),
  body('operatingHours.opensAt').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('operatingHours.closesAt').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('operatingHours.timezone').optional().isString().trim().isLength({ max: 80 }),
];
