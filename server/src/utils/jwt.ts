import jwt, { type SignOptions } from 'jsonwebtoken';import { env } from '../config/env.js';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export interface TokenPayload {
  sub: string;
  email?: string;
  role?: string;
}

export interface TokenInput {
  userId: string;
  email?: string;
  role?: string;
}

export function signAccessToken(input: TokenInput): string {
  const options: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ sub: input.userId, email: input.email, role: input.role }, env.JWT_SECRET, options);
}

export function signRefreshToken(input: TokenInput): string {
  const options: jwt.SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ sub: input.userId, email: input.email, role: input.role }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as TokenPayload;
}
