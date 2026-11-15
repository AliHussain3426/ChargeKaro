// Terminals module
//
// Request validation for supplier-owned terminal management.

import { body } from 'express-validator';
import { PricingType, TerminalStatus } from '../../types/index.js';

const pricingTypeValues = Object.values(PricingType);
const terminalStatusValues = Object.values(TerminalStatus);

export const validateCreateTerminal = [
  body('name').exists().isString().trim().isLength({ min: 2, max: 120 }),
  body('chargingMethod').optional().isString().trim().isLength({ max: 60 }),
  body('connectorTypes').optional().isArray(),
  body('connectorTypes.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('maximumPowerKw').exists().isFloat({ min: 0 }).toFloat(),
  body('capacity').optional().isInt({ min: 1 }).toInt(),
  body('pricing.amount').exists().isFloat({ min: 0 }).toFloat(),
  body('pricing.currency').optional().isString().trim().isLength({ min: 3, max: 6 }),
  body('pricing.billingType').optional().isIn(pricingTypeValues),
  body('status').optional().isIn(terminalStatusValues),
  body('availability').optional().isBoolean().toBoolean(),
];

export const validateUpdateTerminal = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('chargingMethod').optional().isString().trim().isLength({ max: 60 }),
  body('connectorTypes').optional().isArray(),
  body('connectorTypes.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('maximumPowerKw').optional().isFloat({ min: 0 }).toFloat(),
  body('capacity').optional().isInt({ min: 1 }).toInt(),
  body('pricing.amount').optional().isFloat({ min: 0 }).toFloat(),
  body('pricing.currency').optional().isString().trim().isLength({ min: 3, max: 6 }),
  body('pricing.billingType').optional().isIn(pricingTypeValues),
  body('status').optional().isIn(terminalStatusValues),
  body('availability').optional().isBoolean({ strict: false }).toBoolean(),
];

export const validateTerminalStatus = [
  body('status').optional().isIn(terminalStatusValues),
  body('availability').optional().isBoolean({ strict: false }).toBoolean(),
];
