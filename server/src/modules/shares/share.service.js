import mongoose from 'mongoose';
import ShareGrant from '../../models/ShareGrant.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';

export async function access(userId, productId) {
  const owned = await Product.findOne({
    _id: productId,
    userId,
    archivedAt: null,
  }).select('_id userId');
  if (owned) return { ownerId: owned.userId, role: 'owner' };
  const grant = await ShareGrant.findOne({
    productId,
    recipientId: userId,
    revokedAt: null,
  }).lean();
  return grant ? { ownerId: grant.ownerId, role: grant.role } : null;
}

export async function list(userId) {
  const [sent, received] = await Promise.all([
    ShareGrant.find({ ownerId: userId })
      .populate({ path: 'productId', select: 'name category' })
      .populate({ path: 'recipientId', select: 'name email' })
      .sort({ createdAt: -1 })
      .lean(),
    ShareGrant.find({ recipientId: userId, revokedAt: null })
      .populate({ path: 'productId', select: 'name category' })
      .populate({ path: 'ownerId', select: 'name email' })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  return { sent, received };
}

export async function create(userId, input) {
  if (!mongoose.isValidObjectId(input.productId))
    throw new AppError(404, 'NOT_FOUND', 'Item not found');
  const product = await Product.findOne({
    _id: input.productId,
    userId,
    archivedAt: null,
  });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Item not found');
  const email = input.email.toLowerCase();
  const recipient = await User.findOne({ email }).select('_id email');
  if (!recipient)
    throw new AppError(
      404,
      'ACCOUNT_NOT_FOUND',
      'This person needs a LifeLedger account before you can share an item',
    );
  if (String(recipient._id) === String(userId))
    throw new AppError(400, 'SELF_SHARE', 'You already own this item');
  const grant = await ShareGrant.findOneAndUpdate(
    { productId: product.id, recipientId: recipient.id },
    { $set: { ownerId: userId, role: input.role, revokedAt: null } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await recordActivity(userId, {
    entity: 'share',
    action: 'added',
    name: product.name,
    href: '/family',
  });
  await recordActivity(recipient.id, {
    entity: 'share',
    action: 'added',
    name: product.name,
    href: '/family',
  });
  return grant;
}

export async function revoke(userId, id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(404, 'NOT_FOUND', 'Share not found');
  const grant = await ShareGrant.findOneAndUpdate(
    { _id: id, ownerId: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { new: true },
  );
  if (!grant) throw new AppError(404, 'NOT_FOUND', 'Share not found');
  const product = await Product.findById(grant.productId).select('name');
  await recordActivity(userId, {
    entity: 'share',
    action: 'revoked',
    name: product?.name,
    href: '/family',
  });
  await recordActivity(grant.recipientId, {
    entity: 'share',
    action: 'revoked',
    name: product?.name,
    href: '/family',
  });
}
