import { body } from 'express-validator';

export const validateStartSession = [
  body('bookingId').exists().isString().trim().notEmpty().withMessage('Booking ID is required'),
  body('initialSocPercent')
    .exists().withMessage('Initial battery percentage is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Initial battery percentage must be between 0 and 100')
    .toFloat(),
];

export const validateCompleteSession = [
  body('finalSocPercent')
    .exists().withMessage('Final battery percentage is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Final battery percentage must be between 0 and 100')
    .toFloat(),
];
