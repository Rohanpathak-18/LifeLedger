import mongoose from 'mongoose';
import MaintenanceTask from '../../models/MaintenanceTask.js';
import Product from '../../models/Product.js';
import RepairRecord from '../../models/RepairRecord.js';
import { AppError } from '../../utils/responses.js';
import { recordActivity } from '../notifications/notification.service.js';

const dateAtUtc = (value) =>
  value ? new Date(`${value}T00:00:00.000Z`) : value;

async function ownedProduct(userId, productId) {
  if (
    !mongoose.isValidObjectId(productId) ||
    !(await Product.exists({ _id: productId, userId, archivedAt: null }))
  ) {
    throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }
}

function checkId(id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(404, 'NOT_FOUND', 'Record not found');
}

export async function listRepairs(userId) {
  return RepairRecord.find({ userId })
    .populate({
      path: 'productId',
      match: { userId },
      select: 'name brand model',
    })
    .sort({ serviceDate: -1 })
    .lean()
    .then((rows) => rows.filter((row) => row.productId));
}

export async function createRepair(userId, input) {
  await ownedProduct(userId, input.productId);
  const repair = await RepairRecord.create({
    ...input,
    serviceDate: dateAtUtc(input.serviceDate),
    cost: input.cost === '' ? null : input.cost,
    currency: input.currency.toUpperCase(),
    userId,
  });
  await recordActivity(userId, {
    entity: 'repair',
    action: 'added',
    name: repair.description,
    href: '/care',
  });
  return repair;
}

export async function updateRepair(userId, id, input) {
  checkId(id);
  const values = { ...input };
  if (values.serviceDate) values.serviceDate = dateAtUtc(values.serviceDate);
  if (values.cost === '') values.cost = null;
  if (values.currency) values.currency = values.currency.toUpperCase();
  const result = await RepairRecord.findOneAndUpdate(
    { _id: id, userId },
    { $set: values },
    { new: true, runValidators: true },
  );
  if (!result) throw new AppError(404, 'NOT_FOUND', 'Repair record not found');
  await recordActivity(userId, {
    entity: 'repair',
    action: 'updated',
    name: result.description,
    href: '/care',
  });
  return result;
}

export async function removeRepair(userId, id) {
  checkId(id);
  const result = await RepairRecord.findOneAndDelete({ _id: id, userId });
  if (!result) throw new AppError(404, 'NOT_FOUND', 'Repair record not found');
  await recordActivity(userId, {
    entity: 'repair',
    action: 'deleted',
    name: 'Repair record',
    href: '/care',
  });
}

export async function listMaintenance(userId) {
  return MaintenanceTask.find({ userId })
    .populate({
      path: 'productId',
      match: { userId },
      select: 'name brand model',
    })
    .sort({ status: 1, dueDate: 1 })
    .lean()
    .then((rows) => rows.filter((row) => row.productId));
}

export async function createMaintenance(userId, input) {
  await ownedProduct(userId, input.productId);
  const task = await MaintenanceTask.create({
    ...input,
    dueDate: dateAtUtc(input.dueDate),
    userId,
  });
  await recordActivity(userId, {
    entity: 'maintenance',
    action: 'added',
    name: task.title,
    href: '/care',
  });
  return task;
}

export async function updateMaintenance(userId, id, input) {
  checkId(id);
  const current = await MaintenanceTask.findOne({ _id: id, userId });
  if (!current)
    throw new AppError(404, 'NOT_FOUND', 'Maintenance task not found');
  const values = { ...input };
  if (values.dueDate) values.dueDate = dateAtUtc(values.dueDate);
  if (values.status === 'completed') values.completedAt = new Date();
  if (values.status === 'open') values.completedAt = null;
  const result = await MaintenanceTask.findOneAndUpdate(
    { _id: id, userId },
    { $set: values },
    { new: true, runValidators: true },
  );
  if (
    input.status === 'completed' &&
    current.status !== 'completed' &&
    current.recurrence !== 'none'
  ) {
    const nextDate = new Date(current.dueDate);
    if (current.recurrence === 'monthly')
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
    if (current.recurrence === 'quarterly')
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 3);
    if (current.recurrence === 'yearly')
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
    await MaintenanceTask.create({
      userId,
      productId: current.productId,
      title: current.title,
      description: current.description,
      dueDate: nextDate,
      recurrence: current.recurrence,
    });
  }
  if (input.status === 'completed' && current.status !== 'completed') {
    await recordActivity(userId, {
      entity: 'maintenance',
      action: 'updated',
      name: current.title,
      href: '/care',
    });
  }
  return result;
}

export async function removeMaintenance(userId, id) {
  checkId(id);
  const result = await MaintenanceTask.findOneAndDelete({ _id: id, userId });
  if (!result)
    throw new AppError(404, 'NOT_FOUND', 'Maintenance task not found');
  await recordActivity(userId, {
    entity: 'maintenance',
    action: 'deleted',
    name: result.title,
    href: '/care',
  });
}
