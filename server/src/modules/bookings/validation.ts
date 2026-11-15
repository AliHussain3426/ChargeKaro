// Bookings module
//
// Request validation for customer booking workflows.

import { body } from 'express-validator';

export const validateCreateBooking = [
  body('vehicleId').exists().isString().trim().notEmpty(),
  body('stationId').exists().isString().trim().notEmpty(),
  body('terminalId').exists().isString().trim().notEmpty(),
  body('requestedStartTime').exists().isISO8601().toDate(),
  body('requestedEndTime').exists().isISO8601().toDate(),
];
