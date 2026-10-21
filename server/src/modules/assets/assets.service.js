import Product from '../../models/Product.js';

export async function report(userId) {
  const items = await Product.find({ userId, archivedAt: null })
    .sort({ name: 1 })
    .lean();
  const totals = items.reduce((sum, item) => {
    const currency = item.currency || 'USD';
    sum[currency] ||= { purchase: 0, current: 0, replacement: 0 };
    sum[currency].purchase += item.purchasePrice || 0;
    sum[currency].current += item.currentValue ?? item.purchasePrice ?? 0;
    sum[currency].replacement += item.replacementCost || 0;
    return sum;
  }, {});
  return {
    items,
    totals,
    trackedCount: items.filter(
      (item) => item.purchasePrice != null || item.currentValue != null,
    ).length,
  };
}
