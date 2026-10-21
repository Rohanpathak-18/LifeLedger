import Notification from '../../models/Notification.js';
import Product from '../../models/Product.js';
import Warranty from '../../models/Warranty.js';
import MaintenanceTask from '../../models/MaintenanceTask.js';

export async function list(userId) {
  const now = new Date();
  const [activity, products, warranties, care] = await Promise.all([
    Notification.find({ userId, kind: 'activity' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Product.find({ userId, archivedAt: null })
      .select('name purchaseDate valueHistory')
      .lean(),
    Warranty.find({ userId, endDate: { $ne: null } })
      .populate({
        path: 'productId',
        match: { userId, archivedAt: null },
        select: 'name',
      })
      .lean(),
    MaintenanceTask.find({ userId })
      .populate({
        path: 'productId',
        match: { userId, archivedAt: null },
        select: 'name',
      })
      .lean(),
  ]);
  const items = activity.map((row) => ({
    id: String(row._id),
    title: row.title,
    detail: row.message,
    date: row.createdAt,
    href: row.href,
    type: 'activity',
    upcoming: false,
  }));
  for (const product of products) {
    if (product.purchaseDate)
      items.push({
        id: `purchase-${product._id}`,
        title: `${product.name} purchased`,
        detail: 'Purchase recorded',
        date: product.purchaseDate,
        href: `/products/${product._id}`,
        type: 'purchase',
        upcoming: false,
      });
    for (const change of product.valueHistory || [])
      items.push({
        id: `value-${product._id}-${change._id}`,
        title: `Value updated · ${product.name}`,
        detail: `Estimated at ${change.value}`,
        date: change.recordedAt,
        href: `/products/${product._id}`,
        type: 'value',
        upcoming: false,
      });
  }
  for (const warranty of warranties) {
    if (!warranty.productId) continue;
    items.push({
      id: `warranty-${warranty._id}`,
      title: `Coverage ends · ${warranty.productId.name}`,
      detail: warranty.provider || 'Warranty renewal',
      date: warranty.endDate,
      href: '/warranties',
      type: 'warranty',
      upcoming: new Date(warranty.endDate) >= now,
    });
  }
  for (const task of care) {
    if (!task.productId) continue;
    items.push({
      id: `care-${task._id}`,
      title: task.title,
      detail: `${task.productId.name} · ${task.status === 'completed' ? 'Completed' : 'Maintenance'}`,
      date:
        task.status === 'completed'
          ? task.completedAt || task.updatedAt
          : task.dueDate,
      href: '/care',
      type: 'care',
      upcoming: task.status === 'open',
    });
  }
  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}
