// Auth module
//
// Phase 2: request validation rules for authentication endpoints.

import { body } from 'express-validator';

export const validateRegisterCustomer = [
  body('name').exists().isString().trim().isLength({ min: 2, max: 80 }),
  body('email').exists().isEmail().normalizeEmail(),
  body('phone').optional(),
  body('password').exists().isLength({ min: 8, max: 128 }),
  body('passwordConfirm')
    .exists()
    .isLength({ min: 8, max: 128 })
    .custom((value, { req }) => value === req.body.password),
];

export const validateRegisterSupplier = [
  body('name').exists().isString().trim().isLength({ min: 2, max: 80 }),
  body('businessName').exists().isString().trim().isLength({ min: 2, max: 120 }),
  body('email').exists().isEmail().normalizeEmail(),
  body('phone').optional(),
  body('password').exists().isLength({ min: 8, max: 128 }),
  body('passwordConfirm')
    .exists()
    .isLength({ min: 8, max: 128 })
    .custom((value, { req }) => value === req.body.password),
];

export const validateLogin = [
  body('email').exists().isEmail().normalizeEmail(),
  body('password').exists().isString(),
];

export const validateForgotPassword = [
  body('email').exists().isEmail().normalizeEmail(),
];

export const validateResetPassword = [
  body('token').exists().isString(),
  body('password').exists().isLength({ min: 8, max: 128 }),
  body('passwordConfirm')
    .exists()
    .isLength({ min: 8, max: 128 })
    .custom((value, { req }) => value === req.body.password),
];
