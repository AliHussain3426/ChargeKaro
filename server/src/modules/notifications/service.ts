import { Notification } from './model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

async function resolveSupplierUserId(supplierId: string): Promise<string | null> {
  // supplierId may be SupplierProfile id (stored on bookings) or already a user id
  const profile = await SupplierProfile.findById(supplierId).select('user').exec();
  if (profile?.user) return profile.user.toString();
  const profileByUser = await SupplierProfile.findOne({ user: supplierId } as any).select('user').exec();
  if (profileByUser?.user) return profileByUser.user.toString();
  return null;
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    return new Notification({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
    }).save();
  },

  async createMany(inputs: CreateNotificationInput[]) {
    if (inputs.length === 0) return [];
    return Notification.insertMany(
      inputs.map((input) => ({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data ?? {},
      }))
    );
  },

  async notifyBookingSubmitted(booking: any) {
    const supplierUserId = await resolveSupplierUserId(booking.supplierId?.toString?.() ?? String(booking.supplierId));
    const ref = booking.bookingReference ?? 'Booking';
    const tasks: CreateNotificationInput[] = [
      {
        userId: booking.customerId.toString(),
        type: 'BOOKING_SUBMITTED',
        title: 'Booking request submitted',
        message: `Your booking ${ref} was submitted and is awaiting supplier review.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
      },
    ];
    if (supplierUserId) {
      tasks.push({
        userId: supplierUserId,
        type: 'BOOKING_SUBMITTED',
        title: 'New booking request',
        message: `A new booking request (${ref}) is awaiting your decision.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
      });
    }
    await this.createMany(tasks);
  },

  async notifyBookingAccepted(booking: any) {
    const ref = booking.bookingReference ?? 'Booking';
    await this.create({
      userId: booking.customerId.toString(),
      type: 'BOOKING_ACCEPTED',
      title: 'Booking accepted',
      message: `Your booking ${ref} was accepted. Please complete payment to confirm.`,
      data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
    });
  },

  async notifyBookingRejected(booking: any) {
    const ref = booking.bookingReference ?? 'Booking';
    await this.create({
      userId: booking.customerId.toString(),
      type: 'BOOKING_REJECTED',
      title: 'Booking rejected',
      message: `Your booking ${ref} was rejected by the supplier.`,
      data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
    });
  },

  async notifyBookingCancelled(booking: any, actorRole: 'CUSTOMER' | 'SUPPLIER') {
    const ref = booking.bookingReference ?? 'Booking';
    const supplierUserId = await resolveSupplierUserId(booking.supplierId?.toString?.() ?? String(booking.supplierId));
    const tasks: CreateNotificationInput[] = [];
    if (actorRole === 'SUPPLIER') {
      tasks.push({
        userId: booking.customerId.toString(),
        type: 'BOOKING_CANCELLED',
        title: 'Booking cancelled',
        message: `Your booking ${ref} was cancelled by the supplier.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
      });
    } else {
      if (supplierUserId) {
        tasks.push({
          userId: supplierUserId,
          type: 'BOOKING_CANCELLED',
          title: 'Booking cancelled',
          message: `Booking ${ref} was cancelled by the customer.`,
          data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
        });
      }
      tasks.push({
        userId: booking.customerId.toString(),
        type: 'BOOKING_CANCELLED',
        title: 'Booking cancelled',
        message: `You cancelled booking ${ref}.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, status: booking.status },
      });
    }
    await this.createMany(tasks);
  },

  async notifyPaymentUpdate(booking: any, paymentStatus: string) {
    const ref = booking.bookingReference ?? 'Booking';
    const supplierUserId = await resolveSupplierUserId(booking.supplierId?.toString?.() ?? String(booking.supplierId));
    const success = paymentStatus === 'PAID';
    const tasks: CreateNotificationInput[] = [
      {
        userId: booking.customerId.toString(),
        type: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
        title: success ? 'Payment successful' : 'Payment failed',
        message: success
          ? `Payment for booking ${ref} was successful. Your booking is confirmed.`
          : `Payment for booking ${ref} failed. You can try again while the booking awaits payment.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, paymentStatus, status: booking.status },
      },
    ];
    if (supplierUserId) {
      tasks.push({
        userId: supplierUserId,
        type: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
        title: success ? 'Booking payment received' : 'Booking payment failed',
        message: success
          ? `Payment received for booking ${ref}.`
          : `Payment failed for booking ${ref}.`,
        data: { bookingId: booking._id.toString(), bookingReference: ref, paymentStatus, status: booking.status },
      });
    }
    await this.createMany(tasks);
  },

  async listForUser(userId: string) {
    return Notification.find({ userId } as any).sort({ createdAt: -1 }).exec();
  },

  async markRead(userId: string, notificationId: string) {
    const notification = await Notification.findById(notificationId).exec();
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.userId.toString() !== userId) {
      throw new AppError('Forbidden: notification access denied', 403);
    }
    if (!notification.readAt) {
      (notification as any).readAt = new Date();
      await notification.save();
    }
    return notification;
  },

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId, readAt: null } as any, { $set: { readAt: new Date() } }).exec();
  },
};

export type NotificationService = typeof notificationService;
