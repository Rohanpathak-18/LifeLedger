import * as service from './assets.service.js';
import { success } from '../../utils/responses.js';

export async function summary(req, res) {
  return success(res, await service.report(req.user.id));
}

const csvCell = (value) => {
  if (typeof value === 'number') return String(value);
  const text = String(value ?? '');
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};
export async function exportCsv(req, res) {
  const { items } = await service.report(req.user.id);
  const rows = [
    [
      'Item',
      'Category',
      'Location',
      'Purchase date',
      'Purchase price',
      'Current value',
      'Replacement cost',
      'Currency',
      'Serial number',
    ],
    ...items.map((item) => [
      item.name,
      item.category,
      item.location,
      item.purchaseDate?.toISOString?.().slice(0, 10),
      item.purchasePrice,
      item.currentValue,
      item.replacementCost,
      item.currency,
      item.serialNumber,
    ]),
  ];
  res.type('text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="lifeledger-inventory.csv"',
  );
  return res.send(rows.map((row) => row.map(csvCell).join(',')).join('\r\n'));
}
