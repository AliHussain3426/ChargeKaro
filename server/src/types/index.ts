export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum VehicleCategory {
  ELECTRIC_CAR = 'ELECTRIC_CAR',
  ELECTRIC_MOTORCYCLE = 'ELECTRIC_MOTORCYCLE',
  ELECTRIC_SCOOTER = 'ELECTRIC_SCOOTER',
  ELECTRIC_BICYCLE = 'ELECTRIC_BICYCLE',
  OTHER = 'OTHER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum TerminalStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  UNAVAILABLE = 'UNAVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum PricingType {
  PER_KWH = 'PER_KWH',
  PER_MINUTE = 'PER_MINUTE',
  PER_SESSION = 'PER_SESSION',
  FLAT = 'FLAT',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  status?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
