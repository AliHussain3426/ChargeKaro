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

export const validateUpdateProfile = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ min: 5, max: 30 }),
  body('profileImage')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value !== 'string') throw new Error('Profile image must be a string.');
      if (!value.startsWith('data:image/')) throw new Error('Profile image must be a valid image data URL.');
      // Rough size guard: base64 payload should stay under ~2MB.
      if (value.length > 2_800_000) throw new Error('Profile image is too large. Maximum size is 2MB.');
      return true;
    }),
  body('businessName').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('businessDescription').optional({ values: 'falsy' }).isString().trim().isLength({ max: 1000 }),
  body('businessAddress').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 }),
];

export const validateChangePassword = [
  body('currentPassword').exists().isString().isLength({ min: 1, max: 128 }),
  body('newPassword').exists().isString().isLength({ min: 8, max: 128 }),
  body('passwordConfirm')
    .exists()
    .isString()
    .isLength({ min: 8, max: 128 })
    .custom((value, { req }) => value === req.body.newPassword),
];
