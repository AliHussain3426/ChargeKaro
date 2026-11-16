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
  createdAt?: Date | string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
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
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
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

    const accessToken = signAccessToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    });
    const refreshToken = signRefreshToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    });

    return { user: savedUser, profileId: profile._id, accessToken, refreshToken };
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

    const accessToken = signAccessToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    });
    const refreshToken = signRefreshToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    });

    return { user: savedUser, profileId: profile._id, accessToken, refreshToken };
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

  async getMyProfile(userId: string) {
    const user = await this.getAuthenticatedUser(userId);
    let profile: Record<string, unknown> | null = null;

    if (user.role === UserRole.CUSTOMER) {
      const customerProfile = await CustomerProfile.findOne({ user: user._id } as any).exec();
      if (customerProfile) {
        profile = {
          id: customerProfile._id.toString(),
          preferences: customerProfile.preferences ?? {},
          profileImage: customerProfile.profileImage,
        };
      }
    } else if (user.role === UserRole.SUPPLIER) {
      const supplierProfile = await SupplierProfile.findOne({ user: user._id } as any).exec();
      if (supplierProfile) {
        profile = {
          id: supplierProfile._id.toString(),
          businessName: supplierProfile.businessName,
          businessDescription: supplierProfile.businessDescription,
          businessAddress: supplierProfile.businessAddress,
          verificationStatus: supplierProfile.verificationStatus,
        };
      }
    }

    return { user, profile };
  },

  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.getAuthenticatedUser(userId);

    if (input.name !== undefined) user.name = input.name.trim();
    if (input.phone !== undefined) {
      const phone = input.phone.trim();
      user.phone = phone ? phone : undefined;
    }

    await user.save();

    let profile: Record<string, unknown> | null = null;
    if (user.role === UserRole.CUSTOMER) {
      const customerProfile = await CustomerProfile.findOne({ user: user._id } as any).exec();
      if (customerProfile) {
        profile = {
          id: customerProfile._id.toString(),
          preferences: customerProfile.preferences ?? {},
          profileImage: customerProfile.profileImage,
        };
      }
    } else if (user.role === UserRole.SUPPLIER) {
      const supplierProfile = await SupplierProfile.findOne({ user: user._id } as any).exec();
      if (supplierProfile) {
        if (input.businessName !== undefined) supplierProfile.businessName = input.businessName.trim();
        if (input.businessDescription !== undefined) {
          const desc = input.businessDescription.trim();
          supplierProfile.businessDescription = desc ? desc : undefined;
        }
        if (input.businessAddress !== undefined) {
          const addr = input.businessAddress.trim();
          supplierProfile.businessAddress = addr ? addr : undefined;
        }
        await supplierProfile.save();
        profile = {
          id: supplierProfile._id.toString(),
          businessName: supplierProfile.businessName,
          businessDescription: supplierProfile.businessDescription,
          businessAddress: supplierProfile.businessAddress,
          verificationStatus: supplierProfile.verificationStatus,
        };
      }
    }

    return { user, profile };
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
