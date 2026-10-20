import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import Warranty from '../../models/Warranty.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';

const asDate = (value) => (value ? new Date(`${value}T00:00:00.000Z`) : null);
const cleanDates = (input) => {
  const result = { ...input };
  if ('startDate' in result) result.startDate = asDate(result.startDate);
  if ('endDate' in result) result.endDate = asDate(result.endDate);
  return result;
};

function checkId(id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(404, 'NOT_FOUND', 'Warranty not found');
}

export async function list(userId) {
  return Warranty.find({ userId })
    .populate({
      path: 'productId',
      match: { userId, archivedAt: null },
      select: 'name brand model category',
    })
    .sort({ endDate: 1 })
    .lean()
    .then((items) => items.filter((item) => item.productId));
}

export async function create(userId, input) {
  if (!mongoose.isValidObjectId(input.productId))
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const product = await Product.findOne({
    _id: input.productId,
    userId,
    archivedAt: null,
  });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const warranty = await Warranty.create({ ...cleanDates(input), userId });
  await recordActivity(userId, {
    entity: 'warranty',
    action: 'added',
    name: `Warranty for ${product.name}`,
    href: '/warranties',
  });
  return warranty;
}

export async function update(userId, id, input) {
  checkId(id);
  const warranty = await Warranty.findOneAndUpdate(
    { _id: id, userId },
    { $set: cleanDates(input) },
    { new: true, runValidators: true },
  );
  if (!warranty) throw new AppError(404, 'NOT_FOUND', 'Warranty not found');
  const product = await Product.findOne({
    _id: warranty.productId,
    userId,
  }).select('name');
  await recordActivity(userId, {
    entity: 'warranty',
    action: 'updated',
    name: product ? `Warranty for ${product.name}` : 'Warranty',
    href: '/warranties',
  });
  return warranty;
}

export async function remove(userId, id) {
  checkId(id);
  const warranty = await Warranty.findOneAndDelete({ _id: id, userId });
  if (!warranty) throw new AppError(404, 'NOT_FOUND', 'Warranty not found');
  await recordActivity(userId, {
    entity: 'warranty',
    action: 'deleted',
    name: 'Warranty',
    href: '/warranties',
  });
}
