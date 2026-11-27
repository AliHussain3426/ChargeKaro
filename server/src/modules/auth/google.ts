import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';

export const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
export const GOOGLE_OAUTH_INTENT_COOKIE = 'google_oauth_intent';

export type GoogleAuthIntent = 'login' | 'customer_register' | 'supplier_register';

export interface GoogleOAuthStatePayload {
  nonce: string;
  intent: GoogleAuthIntent;
  businessName?: string;
}

export interface GoogleIdentity {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

function getGoogleConfig() {
  const clientId = env.GOOGLE_CLIENT_ID.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET.trim();
  const callbackUrl = env.GOOGLE_CALLBACK_URL.trim();

  if (!clientId || !clientSecret || !callbackUrl) {
    throw new AppError(
      'Google authentication is not configured on the server. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.',
      503
    );
  }

  return { clientId, clientSecret, callbackUrl };
}

export function getGoogleOAuthClient(): OAuth2Client {
  const { clientId, clientSecret, callbackUrl } = getGoogleConfig();
  return new OAuth2Client(clientId, clientSecret, callbackUrl);
}

export function createGoogleOAuthState(payload: Omit<GoogleOAuthStatePayload, 'nonce'>): {
  state: string;
  nonce: string;
} {
  const nonce = crypto.randomBytes(32).toString('hex');
  const state = jwt.sign({ ...payload, nonce }, env.JWT_SECRET, { expiresIn: '10m' });
  return { state, nonce };
}

export function verifyGoogleOAuthState(state: string, expectedNonce?: string): GoogleOAuthStatePayload {
  try {
    const decoded = jwt.verify(state, env.JWT_SECRET) as Partial<GoogleOAuthStatePayload>;
    if (!decoded || typeof decoded.nonce !== 'string' || typeof decoded.intent !== 'string') {
      throw new AppError('Invalid Google authentication state.', 400);
    }
    if (!['login', 'customer_register', 'supplier_register'].includes(decoded.intent)) {
      throw new AppError('Invalid Google authentication intent.', 400);
    }
    if (expectedNonce && decoded.nonce !== expectedNonce) {
      throw new AppError('Google authentication state mismatch. Please try again.', 400);
    }
    return {
      nonce: decoded.nonce,
      intent: decoded.intent as GoogleAuthIntent,
      businessName: typeof decoded.businessName === 'string' ? decoded.businessName : undefined,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Your Google sign-in session expired or is invalid. Please try again.', 400);
  }
}

export function buildGoogleAuthorizationUrl(intent: GoogleAuthIntent, businessName?: string): {
  url: string;
  nonce: string;
} {
  const { clientId } = getGoogleConfig();
  const client = getGoogleOAuthClient();
  const { state, nonce } = createGoogleOAuthState({ intent, businessName });

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
    include_granted_scopes: true,
    redirect_uri: getGoogleConfig().callbackUrl,
    client_id: clientId,
  });

  return { url, nonce };
}

export async function verifyGoogleCallbackCode(code: string): Promise<GoogleIdentity> {
  const { clientId, callbackUrl } = getGoogleConfig();
  const client = getGoogleOAuthClient();

  const { tokens } = await client.getToken({ code, redirect_uri: callbackUrl });
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new AppError('Google did not return an identity token. Please try again.', 401);
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new AppError('Google identity token is missing required information.', 401);
  }

  const email = payload.email.toLowerCase().trim();
  const emailVerified = payload.email_verified === true;
  if (!emailVerified) {
    throw new AppError('Your Google email address is not verified. Please verify your Google email before continuing.', 403);
  }

  const name = (payload.name || email.split('@')[0] || 'Google User').trim();
  const picture = typeof payload.picture === 'string' ? payload.picture : undefined;

  return {
    googleId: payload.sub,
    email,
    emailVerified,
    name,
    picture,
  };
}

export function getSafeClientRedirectBase(): string {
  return env.PRIMARY_CLIENT_URL;
}
