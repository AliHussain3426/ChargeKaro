import { Schema, model, type Document } from 'mongoose';
import {
  AccountStatus,
  UserRole,
  VerificationStatus,
} from '../../types/index.js';

/**
 * User module
 *
 * Phase 1 foundation: identity and account models.
 *
 * The User document holds the common authentication identity and the
 * polymorphic `role` used to determine which profile applies:
 *
 * - CUSTOMER -> linked CustomerProfile
 * - SUPPLIER -> linked SupplierProfile
 * - ADMIN    -> platform administration role
 *
 * Role-specific profile information lives in its own collection and links
 * back to the shared User document through a reference, keeping the common
 * identity and role-specific data logically separated.
 */

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: [10, 'Password hash must be at least 10 characters'],
    },
    role: {
      type: String,
      enum: UserRole,
      default: UserRole.CUSTOMER,
    },
    accountStatus: {
      type: String,
      enum: AccountStatus,
      default: AccountStatus.ACTIVE,
    },
    verificationStatus: {
      type: String,
      enum: VerificationStatus,
      default: VerificationStatus.UNVERIFIED,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, accountStatus: 1 });

export interface User extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
}

export const User = model<User>('User', userSchema);

const customerProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

customerProfileSchema.index({ user: 1 }, { unique: true });

export interface CustomerProfile extends Document {
  user: Schema.Types.ObjectId;
  profileImage?: string;
  preferences: Record<string, unknown>;
}

export const CustomerProfile = model<CustomerProfile>(
  'CustomerProfile',
  customerProfileSchema
);

const supplierProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessDescription: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: VerificationStatus,
      default: VerificationStatus.UNVERIFIED,
    },
  },
  {
    timestamps: true,
  }
);

supplierProfileSchema.index({ user: 1 }, { unique: true });

export interface SupplierProfile extends Document {
  user: Schema.Types.ObjectId;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  verificationStatus: VerificationStatus;
}

export const SupplierProfile = model<SupplierProfile>(
  'SupplierProfile',
  supplierProfileSchema
);
