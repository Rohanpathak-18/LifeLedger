import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import Notification from '../../models/Notification.js';
import Warranty from '../../models/Warranty.js';
import { AppError } from '../../utils/responses.js';

const activityLabels = {
  product: 'Collection item',
  document: 'Document',
  warranty: 'Warranty',
  repair: 'Repair record',
  maintenance: 'Maintenance task',
};

const actionLabels = {
  added: 'added',
  updated: 'updated',
  deleted: 'removed',
  archived: 'archived',
};

export async function recordActivity(userId, { entity, action, name, href }) {
  try {
    const label = activityLabels[entity] || 'Record';
    const verb = actionLabels[action] || 'updated';
    await Notification.create({
      userId,
      kind: 'activity',
      title: `${label} ${verb}`,
      message: name
        ? `${name} was ${verb} in your LifeLedger.`
        : `${label} was ${verb} in your LifeLedger.`,
      href: href || '/notifications',
    });
  } catch (error) {
    logger.warn(
      { err: error, entity, action },
      'Could not save activity notification',
    );
  }
}

export async function list(userId) {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    Notification.countDocuments({ userId, readAt: null }),
  ]);
  return {
    items,
    unreadCount,
    emailAlertsConfigured: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
  };
}

export async function markRead(userId, id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  }
  const item = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  return item;
}

export async function markAllRead(userId) {
  await Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
}

async function sendExpiryEmail({ email, name, productName, endDate }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return false;
  const formattedDate = new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(endDate);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [email],
      subject: `Warranty ending soon: ${productName}`,
      text: `Hello ${name},\n\nThe warranty for ${productName} ends on ${formattedDate}. Review your LifeLedger warranty records: ${env.APP_URL}/warranties\n\nYou received this reminder because this warranty is saved in your LifeLedger account.`,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`Email provider returned HTTP ${response.status}`);
  }
  return true;
}

export async function sendWarrantyExpiryReminders() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const horizon = new Date(now.getTime() + 30 * 86400000);
  const warranties = await Warranty.find({
    endDate: { $gte: startOfToday, $lte: horizon },
  })
    .populate({ path: 'userId', select: 'name email' })
    .populate({
      path: 'productId',
      match: { archivedAt: null },
      select: 'name',
    })
    .lean();

  for (const warranty of warranties) {
    if (!warranty.userId || !warranty.productId) continue;
    const endDateKey = new Date(warranty.endDate).toISOString().slice(0, 10);
    const dedupeKey = `warranty-expiry:${warranty._id}:${endDateKey}`;
    const days = Math.max(
      0,
      Math.ceil((new Date(warranty.endDate) - now) / 86400000),
    );
    let notification;
    try {
      notification = await Notification.findOneAndUpdate(
        { userId: warranty.userId._id, dedupeKey },
        {
          $setOnInsert: {
            userId: warranty.userId._id,
            kind: 'warranty',
            title: 'Warranty ending soon',
            message: `${warranty.productId.name} coverage ends ${new Date(warranty.endDate).toLocaleDateString()}. ${days} day${days === 1 ? '' : 's'} remaining.`,
            href: '/warranties',
            dedupeKey,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).select('+emailSentAt');
    } catch (error) {
      logger.warn(
        { err: error, warrantyId: warranty._id },
        'Could not create warranty reminder',
      );
      continue;
    }

    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || notification.emailSentAt) {
      continue;
    }
    try {
      const sent = await sendExpiryEmail({
        email: warranty.userId.email,
        name: warranty.userId.name,
        productName: warranty.productId.name,
        endDate: warranty.endDate,
      });
      if (sent) {
        await Notification.updateOne(
          { _id: notification._id, emailSentAt: null },
          { $set: { emailSentAt: new Date() } },
        );
      }
    } catch (error) {
      logger.warn(
        { err: error, warrantyId: warranty._id },
        'Warranty email reminder failed',
      );
    }
  }
}

export function startWarrantyReminderJob() {
  const run = () =>
    sendWarrantyExpiryReminders().catch((error) =>
      logger.error({ err: error }, 'Warranty reminder check failed'),
    );
  void run();
  const timer = setInterval(
    run,
    env.WARRANTY_REMINDER_INTERVAL_HOURS * 3600000,
  );
  timer.unref();
}
