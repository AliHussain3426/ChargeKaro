// Auth module
//
// Phase 2: authentication routes wiring validators, controllers, and auth
// middleware into the /api/auth surface.

import { Router } from 'express';
import {
  validateRegisterCustomer,
  validateRegisterSupplier,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
} from './validation.js';
import {
  registerCustomer,
  registerSupplier,
  login,
  refresh,
  me,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
} from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * Public auth routes
 */
router.post('/register/customer', validateRegisterCustomer, registerCustomer);
router.post('/register/supplier', validateRegisterSupplier, registerSupplier);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

/**
 * Protected auth routes
 */
router.post('/refresh', authenticate, refresh);
router.get('/me', authenticate, me);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, validateUpdateProfile, updateProfile);
router.post('/logout', authenticate, logout);

export default router;
