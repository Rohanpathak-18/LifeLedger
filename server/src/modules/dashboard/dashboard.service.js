import mongoose from 'mongoose';
import Document from '../../models/Document.js';
import MaintenanceTask from '../../models/MaintenanceTask.js';
import Product from '../../models/Product.js';
import RepairRecord from '../../models/RepairRecord.js';
import Warranty from '../../models/Warranty.js';

export async function getSummary(userId) {
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 86400000);
  const [
    productCount,
    documentCount,
    warranties,
    recentProducts,
    totals,
    repairs,
    repairTotals,
    maintenance,
  ] = await Promise.all([
    Product.countDocuments({ userId, archivedAt: null }),
    Document.countDocuments({ userId }),
    Warranty.find({ userId })
      .populate({
        path: 'productId',
        match: { userId, archivedAt: null },
        select: 'name brand',
      })
      .sort({ endDate: 1 })
      .lean(),
    Product.find({ userId, archivedAt: null })
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
    Product.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          archivedAt: null,
          purchasePrice: { $ne: null },
        },
      },
      { $group: { _id: '$currency', total: { $sum: '$purchasePrice' } } },
      { $project: { _id: 0, currency: '$_id', total: 1 } },
    ]),
    RepairRecord.find({ userId })
      .populate({ path: 'productId', match: { userId }, select: 'name' })
      .sort({ serviceDate: -1 })
      .limit(3)
      .lean(),
    RepairRecord.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          cost: { $ne: null },
        },
      },
      { $group: { _id: '$currency', total: { $sum: '$cost' } } },
      { $project: { _id: 0, currency: '$_id', total: 1 } },
    ]),
    MaintenanceTask.find({ userId, status: 'open', dueDate: { $gte: now } })
      .populate({
        path: 'productId',
        match: { userId, archivedAt: null },
        select: 'name',
      })
      .sort({ dueDate: 1 })
      .limit(3)
      .lean(),
  ]);
  const relevant = warranties.filter((item) => item.productId);
  return {
    productCount,
    documentCount,
    activeWarranties: relevant.filter(
      (item) => item.endDate && item.endDate >= now,
    ).length,
    expiringWarranties: relevant.filter(
      (item) => item.endDate && item.endDate >= now && item.endDate <= soon,
    ),
    totalsByCurrency: totals,
    repairTotalsByCurrency: repairTotals,
    recentProducts,
    recentRepairs: repairs.filter((item) => item.productId),
    upcomingMaintenance: maintenance.filter((item) => item.productId),
  };
}
