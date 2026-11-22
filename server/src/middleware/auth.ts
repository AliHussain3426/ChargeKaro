// Auth middleware
//
// Phase 2: JWT verification and role-based access control for protected
// backend routes.

import type { Request, Response, NextFunction } from 'express';
import { User } from '../modules/auth/model.js';
import { UserRole, AccountStatus, VerificationStatus } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUserRequest extends Request {
  user?: unknown;
  userId?: string;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const cookieToken = cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }
  return null;
}

export async function authenticate(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req as Request);
    if (!token) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).exec();
    if (!user) {
      next(new AppError('User not found', 401));
      return;
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      next(new AppError('Your account has been suspended. Please contact support for assistance.', 403));
      return;
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      if (user.role === UserRole.SUPPLIER && user.verificationStatus === VerificationStatus.PENDING) {
        next(new AppError('Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.', 403));
        return;
      }
      next(new AppError('Your account is not active. Please contact support for assistance.', 403));
      return;
    }

    if (user.role === UserRole.SUPPLIER && user.verificationStatus !== VerificationStatus.VERIFIED) {
      if (user.verificationStatus === VerificationStatus.REJECTED) {
        next(new AppError('Your supplier account verification was rejected. Please contact support for assistance.', 403));
        return;
      }
      next(new AppError('Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.', 403));
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }
    const user = req.user as { role?: UserRole };
    if (!user.role || !roles.includes(user.role)) {
      next(new AppError('Forbidden: you do not have permission to access this resource', 403));
      return;
    }
    next();
  };
}
