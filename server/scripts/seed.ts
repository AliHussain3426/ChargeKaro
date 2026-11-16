/**
 * Demo data seeder for the EV Charging Platform.
 *
 * Run: npm run seed   (from the server workspace)
 *
 * Safe to run repeatedly: every document is upserted by a stable key and
 * existing documents are never overwritten (only the seeded admin's role and
 * account status are enforced so the documented credentials keep working).
 */

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import {
  AccountStatus,
  BookingStatus,
  PaymentStatus,
  PricingType,
  TerminalStatus,
  UserRole,
  VerificationStatus,
  VehicleCategory,
} from '../src/types/index.js';
import {
  CustomerProfile,
  SupplierProfile,
  User,
} from '../src/modules/auth/model.js';
import { Station } from '../src/modules/stations/model.js';
import { Terminal } from '../src/modules/terminals/model.js';
import { Vehicle } from '../src/modules/vehicles/model.js';
import { Booking } from '../src/modules/bookings/model.js';
import { Payment } from '../src/modules/payments/model.js';
import { Notification } from '../src/modules/notifications/model.js';
import { SystemSettings } from '../src/modules/admin/model.js';

const SALT_ROUNDS = 12;
const DAY = 24 * 60 * 60 * 1000;

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@chargekaro.pk', password: 'Admin@123' },
  supplier: { email: 'supplier@chargekaro.pk', password: 'Supplier@123' },
  customer: { email: 'customer@chargekaro.pk', password: 'Customer@123' },
} as const;

function at(dayOffset: number, hour: number): Date {
  const date = new Date(Date.now() + dayOffset * DAY);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function price(amount: number) {
  return { amount, currency: 'PKR', billingType: PricingType.PER_KWH };
}

async function ensureUser(
  email: string,
  defaults: Record<string, unknown>,
  forced: Record<string, unknown> = {}
) {
  const insertOnly = { ...defaults };
  for (const key of Object.keys(forced)) delete insertOnly[key];
  const update: Record<string, unknown> = { $setOnInsert: insertOnly };
  if (Object.keys(forced).length > 0) update.$set = forced;
  const user = await User.findOneAndUpdate({ email }, update, {
    upsert: true,
    returnDocument: 'after',
  }).exec();
  if (!user) throw new Error(`Unable to create user ${email}`);
  return user;
}

async function seed(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`Seeding MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // --- Accounts -----------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash(DEMO_CREDENTIALS.admin.password, SALT_ROUNDS);
  const admin = await ensureUser(
    DEMO_CREDENTIALS.admin.email,
    {
      name: 'ChargeKaro Admin',
      email: DEMO_CREDENTIALS.admin.email,
      phone: '+92 300 0000001',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
    },
    {
      role: UserRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
    }
  );

  const supplier = await ensureUser(DEMO_CREDENTIALS.supplier.email, {
    name: 'Ayesha Khan',
    email: DEMO_CREDENTIALS.supplier.email,
    phone: '+92 300 0000002',
    passwordHash: await bcrypt.hash(DEMO_CREDENTIALS.supplier.password, SALT_ROUNDS),
    role: UserRole.SUPPLIER,
    accountStatus: AccountStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
  });

  const customer = await ensureUser(DEMO_CREDENTIALS.customer.email, {
    name: 'Ali Raza',
    email: DEMO_CREDENTIALS.customer.email,
    phone: '+92 300 0000003',
    passwordHash: await bcrypt.hash(DEMO_CREDENTIALS.customer.password, SALT_ROUNDS),
    role: UserRole.CUSTOMER,
    accountStatus: AccountStatus.ACTIVE,
    verificationStatus: VerificationStatus.VERIFIED,
  });

  const supplierProfile = await SupplierProfile.findOneAndUpdate(
    { user: supplier._id },
    {
      $setOnInsert: {
        user: supplier._id,
        businessName: 'ChargeKaro Energy (Demo)',
        businessDescription: 'Fast, dependable EV charging across Pakistan.',
        businessAddress: 'Gulberg III, Lahore, Punjab',
        verificationStatus: VerificationStatus.VERIFIED,
      },
    },
    { upsert: true, returnDocument: 'after' }
  ).exec();
  if (!supplierProfile) throw new Error('Unable to create supplier profile');

  const customerProfile = await CustomerProfile.findOneAndUpdate(
    { user: customer._id },
    {
      $setOnInsert: {
        user: customer._id,
        preferences: { notifications: true },
      },
    },
    { upsert: true, returnDocument: 'after' }
  ).exec();
  if (!customerProfile) throw new Error('Unable to create customer profile');

  // --- Stations ------------------------------------------------------------
  const stationSeeds = [
    {
      name: 'ChargeKaro Gulberg Hub',
      address: 'Main Boulevard, Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      coordinates: [74.3405, 31.5204],
      amount: 48,
      opensAt: '00:00',
      closesAt: '23:59',
    },
    {
      name: 'ChargeKaro Clifton Hub',
      address: 'Clifton Block 5, Karachi',
      city: 'Karachi',
      province: 'Sindh',
      coordinates: [67.0011, 24.8146],
      amount: 52,
      opensAt: '06:00',
      closesAt: '23:00',
    },
    {
      name: 'ChargeKaro Blue Area Hub',
      address: 'Jinnah Avenue, Blue Area',
      city: 'Islamabad',
      province: 'ICT',
      coordinates: [73.0479, 33.6844],
      amount: 50,
      opensAt: '00:00',
      closesAt: '23:59',
    },
    {
      name: 'ChargeKaro Model Town Hub',
      address: 'Model Town Link Road',
      city: 'Lahore',
      province: 'Punjab',
      coordinates: [74.309, 31.548],
      amount: 45,
      opensAt: '07:00',
      closesAt: '22:00',
    },
  ];

  const stations: Station[] = [];
  for (const seed of stationSeeds) {
    const station = await Station.findOneAndUpdate(
      { name: seed.name },
      {
        $setOnInsert: {
          supplierId: supplierProfile._id,
          name: seed.name,
          description: `${seed.name} offers reliable EV charging with 24/7 access.`,
          address: seed.address,
          city: seed.city,
          province: seed.province,
          country: 'Pakistan',
          location: { type: 'Point', coordinates: seed.coordinates },
          pricing: price(seed.amount),
          operatingHours: {
            timezone: 'Asia/Karachi',
            opensAt: seed.opensAt,
            closesAt: seed.closesAt,
          },
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
    if (!station) throw new Error(`Unable to create station ${seed.name}`);
    stations.push(station);
  }

  // --- Terminals -----------------------------------------------------------
  const terminalSeeds = [
    {
      station: 0,
      name: 'GC-LHR-GUL-01',
      method: 'AC',
      connectors: ['Type 2'],
      power: 22,
      capacity: 2,
      amount: 48,
      status: TerminalStatus.AVAILABLE,
      availability: true,
    },
    {
      station: 0,
      name: 'GC-LHR-GUL-02',
      method: 'DC',
      connectors: ['CCS2', 'CHAdeMO'],
      power: 60,
      capacity: 1,
      amount: 65,
      status: TerminalStatus.AVAILABLE,
      availability: true,
    },
    {
      station: 1,
      name: 'GC-KHI-CLF-01',
      method: 'AC',
      connectors: ['Type 2'],
      power: 22,
      capacity: 2,
      amount: 52,
      status: TerminalStatus.AVAILABLE,
      availability: true,
    },
    {
      station: 1,
      name: 'GC-KHI-CLF-02',
      method: 'DC',
      connectors: ['CCS2'],
      power: 50,
      capacity: 1,
      amount: 62,
      status: TerminalStatus.MAINTENANCE,
      availability: false,
    },
    {
      station: 2,
      name: 'GC-ISB-BLA-01',
      method: 'AC',
      connectors: ['Type 2'],
      power: 22,
      capacity: 1,
      amount: 50,
      status: TerminalStatus.AVAILABLE,
      availability: true,
    },
    {
      station: 2,
      name: 'GC-ISB-BLA-02',
      method: 'DC',
      connectors: ['CCS2', 'CHAdeMO'],
      power: 75,
      capacity: 1,
      amount: 70,
      status: TerminalStatus.OCCUPIED,
      availability: false,
    },
    {
      station: 3,
      name: 'GC-LHR-MDT-01',
      method: 'AC',
      connectors: ['Type 2'],
      power: 11,
      capacity: 2,
      amount: 45,
      status: TerminalStatus.AVAILABLE,
      availability: true,
    },
  ];

  const terminals: Terminal[] = [];
  for (const seed of terminalSeeds) {
    const terminal = await Terminal.findOneAndUpdate(
      { name: seed.name },
      {
        $setOnInsert: {
          stationId: stations[seed.station]._id,
          name: seed.name,
          chargingMethod: seed.method,
          connectorTypes: seed.connectors,
          maximumPowerKw: seed.power,
          capacity: seed.capacity,
          pricing: price(seed.amount),
          status: seed.status,
          availability: seed.availability,
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
    if (!terminal) throw new Error(`Unable to create terminal ${seed.name}`);
    terminals.push(terminal);
  }
  const terminalByName = new Map(terminals.map((terminal) => [terminal.name, terminal]));

  // --- Vehicles ------------------------------------------------------------
  const vehicleSeeds = [
    {
      manufacturer: 'Tesla',
      model: 'Model 3',
      category: VehicleCategory.ELECTRIC_CAR,
      year: 2024,
      battery: 60,
      connectors: ['Type 2', 'CCS2'],
      maxPower: 150,
    },
    {
      manufacturer: 'BYD',
      model: 'Atto 3',
      category: VehicleCategory.ELECTRIC_CAR,
      year: 2025,
      battery: 61,
      connectors: ['Type 2', 'CCS2'],
      maxPower: 80,
    },
  ];

  const vehicles: Vehicle[] = [];
  for (const seed of vehicleSeeds) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { customerId: customer._id, manufacturer: seed.manufacturer, model: seed.model },
      {
        $setOnInsert: {
          customerId: customer._id,
          manufacturer: seed.manufacturer,
          model: seed.model,
          vehicleCategory: seed.category,
          modelYear: seed.year,
          batteryCapacityKwh: seed.battery,
          connectorTypes: seed.connectors,
          maximumChargingPowerKw: seed.maxPower,
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
    if (!vehicle) throw new Error(`Unable to create vehicle ${seed.model}`);
    vehicles.push(vehicle);
  }

  // --- Bookings & payments -------------------------------------------------
  const bookingSeeds = [
    {
      ref: 'GC-DEMO-1001',
      vehicle: 0,
      terminal: 'GC-LHR-GUL-01',
      startDay: -8,
      startHour: 9,
      hours: 2,
      amount: 720,
      status: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      payment: PaymentStatus.PAID,
    },
    {
      ref: 'GC-DEMO-1002',
      vehicle: 1,
      terminal: 'GC-KHI-CLF-01',
      startDay: -5,
      startHour: 15,
      hours: 2,
      amount: 780,
      status: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      payment: PaymentStatus.PAID,
    },
    {
      ref: 'GC-DEMO-1003',
      vehicle: 0,
      terminal: 'GC-LHR-GUL-02',
      startDay: -2,
      startHour: 11,
      hours: 1,
      amount: 650,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      payment: PaymentStatus.PAID,
    },
    {
      ref: 'GC-DEMO-1004',
      vehicle: 1,
      terminal: 'GC-ISB-BLA-01',
      startDay: 0,
      startHour: 10,
      hours: 2,
      amount: 500,
      status: BookingStatus.IN_PROGRESS,
      paymentStatus: PaymentStatus.PAID,
      payment: PaymentStatus.PAID,
    },
    {
      ref: 'GC-DEMO-1005',
      vehicle: 0,
      terminal: 'GC-LHR-MDT-01',
      startDay: 1,
      startHour: 8,
      hours: 2,
      amount: 450,
      status: BookingStatus.ACCEPTED_AWAITING_PAYMENT,
      paymentStatus: PaymentStatus.UNPAID,
      payment: PaymentStatus.PROCESSING,
    },
    {
      ref: 'GC-DEMO-1006',
      vehicle: 1,
      terminal: 'GC-LHR-GUL-01',
      startDay: 2,
      startHour: 14,
      hours: 1,
      amount: 360,
      status: BookingStatus.PENDING_SUPPLIER,
      paymentStatus: PaymentStatus.UNPAID,
      payment: null,
    },
    {
      ref: 'GC-DEMO-1007',
      vehicle: 0,
      terminal: 'GC-KHI-CLF-01',
      startDay: 3,
      startHour: 16,
      hours: 2,
      amount: 780,
      status: BookingStatus.REJECTED,
      paymentStatus: PaymentStatus.UNPAID,
      payment: null,
    },
    {
      ref: 'GC-DEMO-1008',
      vehicle: 1,
      terminal: 'GC-ISB-BLA-01',
      startDay: -3,
      startHour: 12,
      hours: 1,
      amount: 250,
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.UNPAID,
      payment: null,
    },
  ];

  for (const seed of bookingSeeds) {
    const terminal = terminalByName.get(seed.terminal);
    if (!terminal) throw new Error(`Unknown terminal ${seed.terminal}`);
    const start = at(seed.startDay, seed.startHour);
    const end = new Date(start.getTime() + seed.hours * 60 * 60 * 1000);

    await Booking.findOneAndUpdate(
      { bookingReference: seed.ref },
      {
        $setOnInsert: {
          bookingReference: seed.ref,
          customerId: customer._id,
          supplierId: supplierProfile._id,
          vehicleId: vehicles[seed.vehicle]._id,
          stationId: terminal.stationId,
          terminalId: terminal._id,
          requestedStartTime: start,
          requestedEndTime: end,
          priceSnapshot: price(seed.amount),
          status: seed.status,
          paymentStatus: seed.paymentStatus,
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();

    if (seed.payment) {
      await Payment.findOneAndUpdate(
        { providerReference: `demo-${seed.ref.toLowerCase()}` },
        {
          $setOnInsert: {
            bookingId: (
              await Booking.findOne({ bookingReference: seed.ref }).exec()
            )!._id,
            customerId: customer._id,
            supplierId: supplierProfile._id,
            provider: 'sandbox',
            providerReference: `demo-${seed.ref.toLowerCase()}`,
            providerSessionId: `sess-${seed.ref.toLowerCase()}`,
            idempotencyKey: `idem-${seed.ref.toLowerCase()}`,
            amount: seed.amount,
            currency: 'PKR',
            billingType: PricingType.PER_KWH,
            status: seed.payment,
            processedAt: seed.payment === PaymentStatus.PAID ? start : undefined,
          },
        },
        { upsert: true, returnDocument: 'after' }
      ).exec();
    }
  }

  // --- Notifications -------------------------------------------------------
  const notificationSeeds = [
    {
      days: -8,
      userId: customer._id,
      type: 'BOOKING_SUBMITTED',
      title: 'Booking request sent',
      message: 'Your charging request GC-DEMO-1001 was sent to the supplier.',
      ref: 'GC-DEMO-1001',
      read: true,
    },
    {
      days: -8,
      userId: supplierProfile.user,
      type: 'BOOKING_REQUEST',
      title: 'New booking request',
      message: 'Ali Raza requested a charging session (GC-DEMO-1001).',
      ref: 'GC-DEMO-1001',
      read: true,
    },
    {
      days: -2,
      userId: customer._id,
      type: 'BOOKING_ACCEPTED',
      title: 'Booking confirmed',
      message: 'Your booking GC-DEMO-1003 is confirmed. Payment received.',
      ref: 'GC-DEMO-1003',
      read: false,
    },
    {
      days: -2,
      userId: supplierProfile.user,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment received',
      message: 'Payment for GC-DEMO-1003 has been confirmed.',
      ref: 'GC-DEMO-1003',
      read: false,
    },
    {
      days: 0,
      userId: customer._id,
      type: 'BOOKING_REMINDER',
      title: 'Charging session starting soon',
      message: 'Your session GC-DEMO-1004 is currently in progress.',
      ref: 'GC-DEMO-1004',
      read: false,
    },
  ];

  for (const seed of notificationSeeds) {
    await Notification.findOneAndUpdate(
      {
        userId: seed.userId,
        type: seed.type,
        'data.bookingReference': seed.ref,
      },
      {
        $setOnInsert: {
          userId: seed.userId,
          type: seed.type,
          title: seed.title,
          message: seed.message,
          data: { bookingReference: seed.ref },
          readAt: seed.read ? at(seed.days, 23) : null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).exec();
  }

  // --- Platform settings ---------------------------------------------------
  await SystemSettings.findOneAndUpdate(
    { key: 'global' },
    {
      $setOnInsert: {
        key: 'global',
        platformName: 'ChargeKaro Pakistan',
        supportEmail: 'support@chargekaro.pk',
        currency: 'PKR',
        advanceBookingWindowDays: 7,
        cancellationWindowHours: 2,
        platformCommissionPercent: 10,
        bookingEscalationAlerts: true,
        maintenanceMode: false,
      },
    },
    { upsert: true, returnDocument: 'after' }
  ).exec();

  console.log('\nSeed complete. Demo credentials:');
  console.log(`  Admin    : ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}`);
  console.log(`  Supplier : ${DEMO_CREDENTIALS.supplier.email} / ${DEMO_CREDENTIALS.supplier.password}`);
  console.log(`  Customer : ${DEMO_CREDENTIALS.customer.email} / ${DEMO_CREDENTIALS.customer.password}`);
  console.log(`\nAdmin user id: ${admin._id.toString()}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
