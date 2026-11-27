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
import {
  buildGoogleAuthorizationUrl,
  getSafeClientRedirectBase,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleCallbackCode,
  verifyGoogleOAuthState,
  type GoogleAuthIntent,
} from './google.js';
import { env } from '../../config/env.js';

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
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

function clearAuthCookies(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
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

function getOAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/auth/google',
    maxAge: 10 * 60 * 1000,
  };
}

function clearOAuthCookies(res: Response): void {
  const options = getOAuthCookieOptions();
  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, options);
  res.clearCookie(GOOGLE_OAUTH_INTENT_COOKIE, options);
}

function buildClientRedirect(pathname: string, params?: Record<string, string | undefined>): string {
  const base = getSafeClientRedirectBase();
  const url = new URL(pathname, base);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function resolveGoogleIntent(value: unknown): GoogleAuthIntent {
  if (value === 'login' || value === 'customer_register' || value === 'supplier_register') return value;
  return 'login';
}

export const googleAuthStart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const intent = resolveGoogleIntent(req.query.intent);
    const businessName = typeof req.query.businessName === 'string' ? req.query.businessName.trim() : undefined;

    // Supplier Google registration ideally includes business name. For existing-account sign-in
    // or login-page flows, we allow missing business name and derive a fallback during creation.

    const { url, nonce } = buildGoogleAuthorizationUrl(intent, businessName);
    const cookieOptions = getOAuthCookieOptions();
    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, nonce, cookieOptions);
    res.cookie(GOOGLE_OAUTH_INTENT_COOKIE, intent, cookieOptions);
    res.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Google authentication.';
    res.redirect(buildClientRedirect('/login', { error: message }));
  }
};

export const googleAuthCallback = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const intentCookie = typeof req.cookies?.[GOOGLE_OAUTH_INTENT_COOKIE] === 'string' ? req.cookies[GOOGLE_OAUTH_INTENT_COOKIE] : undefined;
  const fallbackIntent = resolveGoogleIntent(intentCookie);

  try {
    const { code, state, error, error_description } = req.query as Record<string, string | undefined>;
    if (error) {
      clearOAuthCookies(res);
      const message = error_description || error || 'Google authentication was cancelled.';
      const target = fallbackIntent === 'supplier_register' ? '/register/supplier' : fallbackIntent === 'customer_register' ? '/register/customer' : '/login';
      res.redirect(buildClientRedirect(target, { error: message }));
      return;
    }

    if (!code || !state) {
      throw new AppError('Missing Google authentication response. Please try again.', 400);
    }

    const expectedNonce = typeof req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE] === 'string' ? req.cookies[GOOGLE_OAUTH_STATE_COOKIE] : undefined;
    const statePayload = verifyGoogleOAuthState(state, expectedNonce);
    clearOAuthCookies(res);

    const identity = await verifyGoogleCallbackCode(code);
    const result = await authService.authenticateWithGoogle(identity, statePayload.intent, statePayload.businessName);

    if (result.kind === 'pending_supplier') {
      res.redirect(buildClientRedirect('/register/supplier', {
        status: 'pending_verification',
        message: result.message,
      }));
      return;
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);
    const homePath = result.user.role === 'SUPPLIER' ? '/supplier' : result.user.role === 'ADMIN' ? '/admin' : '/customer';
    res.redirect(buildClientRedirect(homePath, { auth: result.isNewUser ? 'google_signup' : 'google_login' }));
  } catch (err) {
    clearOAuthCookies(res);
    const message = err instanceof AppError ? err.message : err instanceof Error ? err.message : 'Google authentication failed. Please try again.';
    const target = fallbackIntent === 'supplier_register' ? '/register/supplier' : fallbackIntent === 'customer_register' ? '/register/customer' : '/login';
    res.redirect(buildClientRedirect(target, { error: message }));
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
  googleAuthStart,
  googleAuthCallback,
};

export default authController;
