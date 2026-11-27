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
import type { GoogleAuthIntent, GoogleIdentity } from './google.js';

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
  profileImage?: string;
  role: string;
  accountStatus: string;
  verificationStatus: string;
  emailVerified?: boolean;
  googleId?: string;
  passwordHash?: string;
  createdAt?: Date | string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  profileImage?: string | null;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function sanitizeUser(user: SanitizeUserSource): Record<string, unknown> {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    avatar: user.profileImage,
    role: user.role,
    accountStatus: user.accountStatus,
    verificationStatus: user.verificationStatus,
    emailVerified: Boolean(user.emailVerified),
    hasPassword: Boolean(user.passwordHash),
    googleLinked: Boolean(user.googleId),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

function issueTokens(user: { _id: { toString(): string }; email: string; role: UserRole }) {
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
  return { accessToken, refreshToken };
}

function assertGoogleLoginAllowed(user: { role: UserRole; accountStatus: AccountStatus; verificationStatus: VerificationStatus }) {
  if (user.accountStatus === AccountStatus.SUSPENDED) {
    throw new AppError('Your account has been suspended. Please contact support for assistance.', 403);
  }

  if (user.accountStatus !== AccountStatus.ACTIVE) {
    if (user.role === UserRole.SUPPLIER && user.verificationStatus === VerificationStatus.PENDING) {
      throw new AppError(
        'Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.',
        403
      );
    }
    throw new AppError('Your account is not active. Please contact support for assistance.', 403);
  }

  if (user.role === UserRole.SUPPLIER && user.verificationStatus !== VerificationStatus.VERIFIED) {
    if (user.verificationStatus === VerificationStatus.REJECTED) {
      throw new AppError('Your supplier account verification was rejected. Please contact support for assistance.', 403);
    }
    throw new AppError(
      'Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.',
      403
    );
  }
}

export type GoogleAuthResult =
  | {
      kind: 'authenticated';
      user: any;
      accessToken: string;
      refreshToken: string;
      isNewUser: boolean;
    }
  | {
      kind: 'pending_supplier';
      user: any;
      message: string;
      isNewUser: boolean;
    };

export const authService = {
  async authenticateWithGoogle(
    identity: GoogleIdentity,
    intent: GoogleAuthIntent,
    businessName?: string
  ): Promise<GoogleAuthResult> {
    if (!identity.emailVerified) {
      throw new AppError('Your Google email address is not verified. Please verify your Google email before continuing.', 403);
    }

    // 1) Existing linked Google account
    let user = await User.findOne({ googleId: identity.googleId }).exec();
    let isNewUser = false;

    if (!user) {
      // 2) Secure account linking by verified email ownership
      const existingByEmail = await User.findOne({ email: identity.email.toLowerCase() }).exec();
      if (existingByEmail) {
        existingByEmail.googleId = identity.googleId;
        existingByEmail.emailVerified = true;
        if (!existingByEmail.profileImage && identity.picture) {
          existingByEmail.profileImage = identity.picture;
        }
        if (!existingByEmail.name && identity.name) {
          existingByEmail.name = identity.name;
        }
        user = await existingByEmail.save();

        if (user.role === UserRole.CUSTOMER) {
          const profile = await CustomerProfile.findOne({ user: user._id } as any).exec();
          if (profile && !profile.profileImage && identity.picture) {
            profile.profileImage = identity.picture;
            await profile.save();
          }
        } else if (user.role === UserRole.SUPPLIER) {
          const profile = await SupplierProfile.findOne({ user: user._id } as any).exec();
          if (profile && !profile.profileImage && identity.picture) {
            profile.profileImage = identity.picture;
            await profile.save();
          }
        }
      }
    }

    // 3) Create new account if no existing match
    if (!user) {
      isNewUser = true;
      if (intent === 'supplier_register') {
        const resolvedBusinessName = (businessName || '').trim() || `${identity.name.trim()}'s Business`;
        const newUser = new User({
          name: identity.name.trim() || 'Google User',
          email: identity.email.toLowerCase(),
          profileImage: identity.picture,
          role: UserRole.SUPPLIER,
          accountStatus: AccountStatus.PENDING,
          verificationStatus: VerificationStatus.PENDING,
          googleId: identity.googleId,
          emailVerified: true,
        });
        const savedUser = await newUser.save();
        await new SupplierProfile({
          user: savedUser._id,
          businessName: resolvedBusinessName,
          profileImage: identity.picture,
          verificationStatus: VerificationStatus.PENDING,
        }).save();

        return {
          kind: 'pending_supplier',
          user: savedUser,
          isNewUser: true,
          message:
            'Your supplier account has been created with Google and is pending admin verification. Please wait up to 24 hours for your account to be verified.',
        };
      }

      const newUser = new User({
        name: identity.name.trim() || 'Google User',
        email: identity.email.toLowerCase(),
        profileImage: identity.picture,
        role: UserRole.CUSTOMER,
        accountStatus: AccountStatus.ACTIVE,
        verificationStatus: VerificationStatus.UNVERIFIED,
        googleId: identity.googleId,
        emailVerified: true,
      });
      const savedUser = await newUser.save();
      await new CustomerProfile({
        user: savedUser._id,
        profileImage: identity.picture,
        preferences: {},
      }).save();
      user = savedUser;
    } else {
      // Keep Google profile data fresh where safe
      let changed = false;
      if (!user.googleId) { user.googleId = identity.googleId; changed = true; }
      if (user.emailVerified !== true) { user.emailVerified = true; changed = true; }
      if (!user.profileImage && identity.picture) { user.profileImage = identity.picture; changed = true; }
      if (changed) await user.save();
    }

    assertGoogleLoginAllowed(user);
    const tokens = issueTokens(user);
    return {
      kind: 'authenticated',
      user,
      ...tokens,
      isNewUser,
    };
  },

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
      accountStatus: AccountStatus.PENDING,
      verificationStatus: VerificationStatus.PENDING,
    });
    const savedUser = await user.save();
    const profile = await new SupplierProfile({
      user: savedUser._id,
      businessName: input.businessName,
      businessDescription: undefined,
      businessAddress: undefined,
      verificationStatus: VerificationStatus.PENDING,
    }).save();

    return {
      user: savedUser,
      profileId: profile._id,
      pendingVerification: true,
      message:
        'Your supplier account has been created and is pending admin verification. Please wait up to 24 hours for your account to be verified.',
    };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).exec();
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.passwordHash) {
      throw new AppError(
        'This account uses Google sign-in. Please continue with Google, or set a password after signing in.',
        400
      );
    }

    const validPassword = await bcryptCompare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact support for assistance.', 403);
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      if (user.role === UserRole.SUPPLIER && user.verificationStatus === VerificationStatus.PENDING) {
        throw new AppError(
          'Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.',
          403
        );
      }
      throw new AppError('Your account is not active. Please contact support for assistance.', 403);
    }

    if (user.role === UserRole.SUPPLIER && user.verificationStatus !== VerificationStatus.VERIFIED) {
      if (user.verificationStatus === VerificationStatus.REJECTED) {
        throw new AppError('Your supplier account verification was rejected. Please contact support for assistance.', 403);
      }
      throw new AppError(
        'Your supplier account is pending admin verification. Please wait up to 24 hours for your account to be verified.',
        403
      );
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
    let profileImage = user.profileImage;

    if (user.role === UserRole.CUSTOMER) {
      const customerProfile = await CustomerProfile.findOne({ user: user._id } as any).exec();
      if (customerProfile) {
        profileImage = profileImage ?? customerProfile.profileImage;
        profile = {
          id: customerProfile._id.toString(),
          preferences: customerProfile.preferences ?? {},
          profileImage,
        };
      }
    } else if (user.role === UserRole.SUPPLIER) {
      const supplierProfile = await SupplierProfile.findOne({ user: user._id } as any).exec();
      if (supplierProfile) {
        profileImage = profileImage ?? supplierProfile.profileImage;
        profile = {
          id: supplierProfile._id.toString(),
          profileImage,
          businessName: supplierProfile.businessName,
          businessDescription: supplierProfile.businessDescription,
          businessAddress: supplierProfile.businessAddress,
          verificationStatus: supplierProfile.verificationStatus,
        };
      }
    }

    if (profileImage && user.profileImage !== profileImage) {
      user.profileImage = profileImage;
      await user.save();
    }

    if (!profile) {
      profile = { profileImage };
    } else if (profile.profileImage === undefined && profileImage) {
      profile.profileImage = profileImage;
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
    if (input.profileImage !== undefined) {
      user.profileImage = input.profileImage ? input.profileImage : undefined;
    }

    await user.save();

    let profile: Record<string, unknown> | null = null;
    if (user.role === UserRole.CUSTOMER) {
      const customerProfile = await CustomerProfile.findOne({ user: user._id } as any).exec();
      if (customerProfile) {
        if (input.profileImage !== undefined) {
          customerProfile.profileImage = input.profileImage ? input.profileImage : undefined;
        }
        await customerProfile.save();
        profile = {
          id: customerProfile._id.toString(),
          preferences: customerProfile.preferences ?? {},
          profileImage: customerProfile.profileImage ?? user.profileImage,
        };
      }
    } else if (user.role === UserRole.SUPPLIER) {
      const supplierProfile = await SupplierProfile.findOne({ user: user._id } as any).exec();
      if (supplierProfile) {
        if (input.profileImage !== undefined) {
          supplierProfile.profileImage = input.profileImage ? input.profileImage : undefined;
        }
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
          profileImage: supplierProfile.profileImage ?? user.profileImage,
          businessName: supplierProfile.businessName,
          businessDescription: supplierProfile.businessDescription,
          businessAddress: supplierProfile.businessAddress,
          verificationStatus: supplierProfile.verificationStatus,
        };
      }
    }

    if (!profile) {
      profile = { profileImage: user.profileImage };
    } else if (profile.profileImage === undefined) {
      profile.profileImage = user.profileImage;
    }

    return { user, profile };
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await User.findById(userId).select('+passwordHash').exec();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.passwordHash) {
      throw new AppError(
        'This account was created with Google sign-in and does not have a local password yet. Use password reset to create one.',
        400
      );
    }

    const validPassword = await bcryptCompare(input.currentPassword, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.passwordHash = await bcryptHash(input.newPassword, SALT_ROUNDS);
    await user.save();
    return { message: 'Password changed successfully' };
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
