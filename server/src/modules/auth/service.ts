// Auth module
//
// Phase 2: authentication and identity business logic for customer and
// supplier registration, login, token issuance, and password management.

import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { User, CustomerProfile, SupplierProfile } from './model.js';
import { UserRole, AccountStatus, VerificationStatus } from '../../types/index.js';
import { signAccessToken, signRefreshToken } from '../../utils/jwt.js';
import { AppError } from '../../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

const bcryptHash = promisify(bcrypt.hash) as unknown as (
  password: string,
  saltOrRounds: number
) => Promise<string>;
const bcryptCompare = promisify(bcrypt.compare) as unknown as (
  password: string,
  hash: string
) => Promise<boolean>;

export interface RegisterCustomerInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterSupplierInput {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SanitizeUserSource {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  verificationStatus: string;
}

export function sanitizeUser(user: SanitizeUserSource): Record<string, unknown> {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    verificationStatus: user.verificationStatus,
  };
}

export const authService = {
  async registerCustomer(input: RegisterCustomerInput) {
    const existingUser = await User.findOne({ email: input.email }).exec();
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = new User({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: await bcryptHash(input.password, SALT_ROUNDS),
      role: UserRole.CUSTOMER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
    });
    const savedUser = await user.save();
    const profile = await new CustomerProfile({
      user: savedUser._id,
      preferences: {},
    }).save();

    return { user: savedUser, profileId: profile._id };
  },

  async registerSupplier(input: RegisterSupplierInput) {
    const existingUser = await User.findOne({ email: input.email }).exec();
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = new User({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: await bcryptHash(input.password, SALT_ROUNDS),
      role: UserRole.SUPPLIER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
    });
    const savedUser = await user.save();
    const profile = await new SupplierProfile({
      user: savedUser._id,
      businessName: input.businessName,
      businessDescription: undefined,
      businessAddress: undefined,
      verificationStatus: VerificationStatus.UNVERIFIED,
    }).save();

    return { user: savedUser, profileId: profile._id };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).exec();
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const validPassword = await bcryptCompare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid email or password', 401);
    }

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

    return { user, accessToken, refreshToken };
  },

  async getAuthenticatedUser(userId: string) {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
    }
    return { message: 'Password reset instructions were generated' };
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({ resetPasswordToken: token })
      .select('+resetPasswordToken +resetPasswordExpires')
      .exec();
    if (!user || !user.resetPasswordExpires) {
      throw new AppError('Password reset token is invalid or expired', 400);
    }
    if (user.resetPasswordExpires < new Date()) {
      throw new AppError('Password reset token is invalid or expired', 400);
    }

    user.passwordHash = await bcryptHash(newPassword, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return { message: 'Password was reset successfully' };
  },
};

export type AuthService = typeof authService;
