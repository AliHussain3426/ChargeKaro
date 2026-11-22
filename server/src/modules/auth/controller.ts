// Auth module
//
// Phase 2: authentication controllers handling registration, login,
// token issuance, session, and password flows.

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authService, sanitizeUser } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { signAccessToken, signRefreshToken, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../utils/jwt.js';
import type { SanitizeUserSource } from './service.js';

interface AuthenticatedUserRequest {
  userId?: string;
}

function handleValidationError(req: Request): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new AppError(result.array()[0]?.msg ?? 'Validation failed', 400);
  }
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { httpOnly: true, sameSite: 'lax', path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export const registerCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidationError(req);
    const result = await authService.registerCustomer({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      data: { user: sanitizeUser(result.user as unknown as SanitizeUserSource) },
    });
  } catch (error) {
    next(error);
  }
};

export const registerSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidationError(req);
    const result = await authService.registerSupplier({
      name: req.body.name,
      businessName: req.body.businessName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: sanitizeUser(result.user as unknown as SanitizeUserSource),
        pendingVerification: true,
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    handleValidationError(req);
    const { user, accessToken, refreshToken } = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user as unknown as SanitizeUserSource),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthenticatedUserRequest).userId;
    const user = await authService.getAuthenticatedUser(userId as string);
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: sanitizeUser(user as unknown as SanitizeUserSource),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthenticatedUserRequest).userId;
    const { user, profile } = await authService.getMyProfile(userId as string);
    res.json({
      success: true,
      message: 'Authenticated user retrieved successfully',
      data: { user: sanitizeUser(user as unknown as SanitizeUserSource), profile },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthenticatedUserRequest).userId;
    const { user, profile } = await authService.getMyProfile(userId as string);
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user: sanitizeUser(user as unknown as SanitizeUserSource), profile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedUserRequest).userId;
    const { user, profile } = await authService.updateMyProfile(userId as string, {
      name: req.body.name,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      businessName: req.body.businessName,
      businessDescription: req.body.businessDescription,
      businessAddress: req.body.businessAddress,
    });
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: sanitizeUser(user as unknown as SanitizeUserSource), profile },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    handleValidationError(req);
    const userId = (req as AuthenticatedUserRequest).userId;
    const { message } = await authService.changePassword(userId as string, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    res.json({
      success: true,
      message,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidationError(req);
    const { message } = await authService.requestPasswordReset(req.body.email);
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    handleValidationError(req);
    const { message } = await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerCustomer,
  registerSupplier,
  login,
  refresh,
  me,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};

export default authController;
