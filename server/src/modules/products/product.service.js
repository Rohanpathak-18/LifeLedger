import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import Warranty from '../../models/Warranty.js';
import RepairRecord from '../../models/RepairRecord.js';
import MaintenanceTask from '../../models/MaintenanceTask.js';
import { removeForProduct } from '../documents/document.service.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';

function cleanDate(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function normalizeInput(input) {
  const output = { ...input };
  if ('purchaseDate' in output)
    output.purchaseDate = cleanDate(output.purchaseDate);
  if (output.purchasePrice === '' || output.purchasePrice === null)
    output.purchasePrice = null;
  if (output.currency) output.currency = output.currency.toUpperCase();
  return output;
}

function validId(id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
}

export async function list(userId, query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter = {
    userId,
    archivedAt: query.archived === 'true' ? { $ne: null } : null,
  };
  if (query.category) filter.category = query.category;
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const search = new RegExp(escaped, 'i');
    filter.$or = [
      { name: search },
      { brand: search },
      { model: search },
      { category: search },
    ];
  }

  const sortOptions = {
    recent: { updatedAt: -1 },
    name: { name: 1 },
    purchaseDate: { purchaseDate: -1 },
    price: { purchasePrice: -1 },
  };
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions[query.sort] || sortOptions.recent)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function create(userId, input) {
  const product = await Product.create({ ...normalizeInput(input), userId });
  await recordActivity(userId, {
    entity: 'product',
    action: 'added',
    name: product.name,
    href: `/products/${product.id}`,
  });
  return product;
}

export async function get(userId, id) {
  validId(id);
  const product = await Product.findOne({ _id: id, userId });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const warranties = await Warranty.find({ userId, productId: product.id })
    .sort({ endDate: 1 })
    .lean();
  return { product, warranties };
}

export async function update(userId, id, input) {
  validId(id);
  const product = await Product.findOneAndUpdate(
    { _id: id, userId, archivedAt: null },
    { $set: normalizeInput(input) },
    { new: true, runValidators: true },
  );
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  await recordActivity(userId, {
    entity: 'product',
    action: 'updated',
    name: product.name,
    href: `/products/${product.id}`,
  });
  return product;
}

export async function archive(userId, id) {
  validId(id);
  const product = await Product.findOneAndUpdate(
    { _id: id, userId, archivedAt: null },
    { $set: { archivedAt: new Date() } },
    { new: true },
  );
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  await recordActivity(userId, {
    entity: 'product',
    action: 'archived',
    name: product.name,
    href: '/products',
  });
  return product;
}

export async function remove(userId, id) {
  validId(id);
  const product = await Product.findOneAndDelete({ _id: id, userId });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  await Promise.all([
    Warranty.deleteMany({ userId, productId: product.id }),
    RepairRecord.deleteMany({ userId, productId: product.id }),
    MaintenanceTask.deleteMany({ userId, productId: product.id }),
    removeForProduct(userId, product.id),
  ]);
  await recordActivity(userId, {
    entity: 'product',
    action: 'deleted',
    name: product.name,
    href: '/products',
  });
  return product;
}
