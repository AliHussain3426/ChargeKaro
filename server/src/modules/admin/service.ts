import { User, SupplierProfile } from '../auth/model.js';
import { Station } from '../stations/model.js';
import { Terminal } from '../terminals/model.js';
import { Booking } from '../bookings/model.js';
import { Payment } from '../payments/model.js';
import { SystemSettings } from './model.js';
import { AppError } from '../../middleware/errorHandler.js';

const PII_FIELDS = new Set([
  'name',
  'email',
  'phone',
  'password',
  'passwordHash',
  'businessName',
  'businessDescription',
  'businessAddress',
  'profileImage',
  'preferences',
]);

export const adminService = {
  async getOverview() {
    const [users, customers, suppliers, stations, terminals, bookings, pendingBookings, confirmedBookings, completedBookings, paidPayments] = await Promise.all([
      User.countDocuments({}).exec(),
      User.countDocuments({ role: 'CUSTOMER' } as any).exec(),
      User.countDocuments({ role: 'SUPPLIER' } as any).exec(),
      Station.countDocuments({}).exec(),
      Terminal.countDocuments({}).exec(),
      Booking.countDocuments({}).exec(),
      Booking.countDocuments({ status: 'PENDING_SUPPLIER' } as any).exec(),
      Booking.countDocuments({ status: { $in: ['CONFIRMED', 'ACCEPTED_AWAITING_PAYMENT', 'IN_PROGRESS'] } } as any).exec(),
      Booking.countDocuments({ status: 'COMPLETED' } as any).exec(),
      Payment.countDocuments({ status: 'PAID' } as any).exec(),
    ]);

    return {
      counts: {
        users,
        customers,
        suppliers,
        stations,
        terminals,
        bookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        paidPayments,
      },
    };
  },

  async listUsers() {
    const users = await User.find({})
      .select('name email phone role accountStatus verificationStatus createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return users.map((u: any) => ({ ...u, id: u._id?.toString?.() ?? u._id }));
  },

  async listSuppliers() {
    const suppliers = await SupplierProfile.find({})
      .populate({ path: 'user', select: 'name email phone role accountStatus verificationStatus createdAt' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const stationCounts = await Station.aggregate([
      { $group: { _id: '$supplierId', count: { $sum: 1 } } },
    ]).exec();
    const countMap = new Map(stationCounts.map((s: any) => [s._id.toString(), s.count]));

    return suppliers.map((s: any) => ({
      ...s,
      id: s._id?.toString?.() ?? s._id,
      stationCount: countMap.get(s._id.toString()) ?? 0,
    }));
  },

  async listStations() {
    const stations = await Station.find({})
      .populate({ path: 'supplierId', select: 'businessName user', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const terminalCounts = await Terminal.aggregate([
      { $group: { _id: '$stationId', count: { $sum: 1 } } },
    ]).exec();
    const countMap = new Map(terminalCounts.map((t: any) => [t._id.toString(), t.count]));

    return stations.map((st: any) => ({
      ...st,
      id: st._id?.toString?.() ?? st._id,
      terminalCount: countMap.get(st._id.toString()) ?? 0,
    }));
  },

  async listTerminals() {
    const terminals = await Terminal.find({})
      .populate({ path: 'stationId', select: 'name city supplierId' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return terminals.map((t: any) => ({ ...t, id: t._id?.toString?.() ?? t._id }));
  },

  async listBookings() {
    const bookings = await Booking.find({})
      .populate('stationId', 'name city')
      .populate('terminalId', 'name connectorTypes maximumPowerKw')
      .populate('vehicleId', 'manufacturer model')
      .populate('customerId', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return bookings.map((b: any) => ({ ...b, id: b._id?.toString?.() ?? b._id }));
  },

  async getReports() {
    const overview = await this.getOverview();
    const [grossAgg, recentBookings] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, gross: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]).exec(),
      Booking.find({}).sort({ createdAt: -1 }).limit(10).select('bookingReference status paymentStatus priceSnapshot createdAt').lean().exec(),
    ]);
    const gross = grossAgg[0]?.gross ?? 0;
    const feeRate = 0.1;
    return {
      ...overview,
      revenue: {
        gross,
        platformFee: Math.round(gross * feeRate * 100) / 100,
        netPayable: Math.round(gross * (1 - feeRate) * 100) / 100,
        feeRate,
      },
      recentBookings,
    };
  },

  async getSettings() {
    let settings = await SystemSettings.findOne({ key: 'global' }).exec();
    if (!settings) {
      settings = await new SystemSettings({ key: 'global' }).save();
    }
    return settings;
  },

  async updateSettings(input: Record<string, unknown>) {
    const allowed = [
      'platformName',
      'supportEmail',
      'currency',
      'advanceBookingWindowDays',
      'cancellationWindowHours',
      'platformCommissionPercent',
      'bookingEscalationAlerts',
      'maintenanceMode',
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (input[key] !== undefined) update[key] = input[key];
    }
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: update, $setOnInsert: { key: 'global' } },
      { new: true, upsert: true }
    ).exec();
    return settings;
  },

  async updateUserOversight(userId: string, input: Record<string, unknown>) {
    const piiAttempt = Object.keys(input || {}).some((k) => PII_FIELDS.has(k));
    if (piiAttempt) {
      throw new AppError('Forbidden: admin does not have permission to modify user PII', 403);
    }
    const user = await User.findById(userId).exec();
    if (!user) throw new AppError('User not found', 404);

    if (input.accountStatus !== undefined) (user as any).accountStatus = input.accountStatus;
    if (input.verificationStatus !== undefined) (user as any).verificationStatus = input.verificationStatus;

    await user.save();
    return user;
  },

  async updateSupplierOversight(supplierProfileId: string, input: Record<string, unknown>) {
    const piiAttempt = Object.keys(input || {}).some((k) => PII_FIELDS.has(k));
    if (piiAttempt) {
      throw new AppError('Forbidden: admin does not have permission to modify supplier PII', 403);
    }
    const profile = await SupplierProfile.findById(supplierProfileId).populate('user').exec();
    if (!profile) throw new AppError('Supplier profile not found', 404);

    if (input.verificationStatus !== undefined) {
      (profile as any).verificationStatus = input.verificationStatus;
      await profile.save();
      // keep linked user verification in sync for convenience
      const user = (profile as any).user;
      if (user && input.verificationStatus) {
        user.verificationStatus = input.verificationStatus;
        await user.save();
      }
    }
    return profile;
  },
};

export type AdminService = typeof adminService;
