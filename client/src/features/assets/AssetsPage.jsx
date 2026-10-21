import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  Boxes,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import { assetsService } from './assets.service.js';

const money = (value, currency) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
const totals = (report, field) =>
  Object.entries(report?.totals || {})
    .map(([currency, values]) => money(values[field], currency))
    .join(' · ') || '—';
export default function AssetsPage() {
  const [report, setReport] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    assetsService
      .summary()
      .then(setReport)
      .catch(() => setError('Your asset summary could not be loaded.'));
  }, []);
  const items = report?.items || [];
  const selected = items.find((item) => item._id === selectedId) || items[0];
  const tracked = items.filter(
    (item) => item.currentValue != null || item.purchasePrice != null,
  );
  const depreciation =
    Object.entries(report?.totals || {})
      .map(([currency]) =>
        money(
          tracked
            .filter((item) => item.currency === currency)
            .reduce(
              (sum, item) =>
                sum +
                Math.max(
                  0,
                  (item.purchasePrice || 0) -
                    (item.currentValue ?? item.purchasePrice ?? 0),
                ),
              0,
            ),
          currency,
        ),
      )
      .join(' · ') || '—';
  const valuePoints = selected
    ? [
        ...(selected.purchasePrice != null && selected.purchaseDate
          ? [
              {
                date: selected.purchaseDate,
                value: selected.purchasePrice,
                label: 'Purchase price',
              },
            ]
          : []),
        ...(selected.valueHistory || []).map((point) => ({
          date: point.recordedAt,
          value: point.value,
          label: 'Estimated value',
        })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];
  async function download() {
    try {
      await assetsService.exportCsv();
    } catch {
      toast.error('Could not download the inventory report.');
    }
  }
  return (
    <main className="main-content assets-page">
      <div className="collection-page-heading assets-heading">
        <div>
          <span className="section-kicker">
            A CLEARER PICTURE OF WHAT YOU OWN
          </span>
          <h1>
            Your assets, <em>accounted for.</em>
          </h1>
          <p>
            Track what you paid, today’s estimate, and the cost to replace it.
          </p>
        </div>
        <button className="primary-button" onClick={download}>
          <ArrowDownToLine size={15} /> Download inventory
        </button>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      <section className="asset-metrics">
        <article className="asset-metric">
          <span className="metric-icon metric-gold">
            <Boxes size={16} />
          </span>
          <small>ESTIMATED CURRENT VALUE</small>
          <strong>{totals(report, 'current')}</strong>
          <span>{report?.trackedCount ?? '—'} items with a recorded value</span>
        </article>
        <article className="asset-metric">
          <span className="metric-icon metric-green">
            <ChartNoAxesColumnIncreasing size={16} />
          </span>
          <small>RECORDED PURCHASE VALUE</small>
          <strong>{totals(report, 'purchase')}</strong>
          <span>Across saved purchase prices</span>
        </article>
        <article className="asset-metric">
          <span className="metric-icon metric-ink">
            <ShieldCheck size={16} />
          </span>
          <small>REPLACEMENT ESTIMATE</small>
          <strong>{totals(report, 'replacement')}</strong>
          <span>{report ? `${depreciation} estimated depreciation` : '—'}</span>
        </article>
      </section>
      {selected && (
        <section className="detail-panel asset-history-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">VALUE OVER TIME</span>
              <h2>{selected.name}</h2>
            </div>
            <label className="filter-select">
              <span>Choose an item</span>
              <select
                value={selected._id}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {valuePoints.length > 1 ? (
            <div className="value-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={valuePoints}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#ac956c"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ac956c"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#e8e5dc"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString(undefined, {
                        month: 'short',
                        year: '2-digit',
                      })
                    }
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#89857c', fontSize: 9 }}
                  />
                  <YAxis
                    width={58}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat(undefined, {
                        notation: 'compact',
                      }).format(value)
                    }
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#89857c', fontSize: 9 }}
                  />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                    formatter={(value) => [
                      money(value, selected.currency),
                      'Estimated value',
                    ]}
                    contentStyle={{
                      border: '1px solid #e5e2d8',
                      borderRadius: 3,
                      background: '#faf9f5',
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b7045"
                    strokeWidth={2}
                    fill="url(#valueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted-copy value-chart-note">
              Update the estimated current value over time to see its history
              here.
            </p>
          )}
        </section>
      )}
      <section className="asset-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR INVENTORY, AT A GLANCE</span>
            <h2>
              Item values <span>{items.length}</span>
            </h2>
          </div>
          <Link className="text-link" to="/products/new">
            Add an item <span>↗</span>
          </Link>
        </div>
        {!items.length && report && (
          <div className="inventory-empty">
            <h2>No values recorded yet</h2>
            <p>
              Add purchase, current, and replacement values to build your
              inventory report.
            </p>
            <Link className="primary-button" to="/products/new">
              Add your first item
            </Link>
          </div>
        )}
        <div className="asset-table">
          {items.map((item) => (
            <Link
              to={`/products/${item._id}`}
              className="asset-row"
              key={item._id}
            >
              <span className="asset-item-name">
                <strong>{item.name}</strong>
                <small>{item.location || item.category}</small>
              </span>
              <span>
                <small>PAID</small>
                <strong>{money(item.purchasePrice, item.currency)}</strong>
              </span>
              <span>
                <small>ESTIMATED NOW</small>
                <strong>
                  {money(
                    item.currentValue ?? item.purchasePrice,
                    item.currency,
                  )}
                </strong>
              </span>
              <span>
                <small>REPLACE</small>
                <strong>{money(item.replacementCost, item.currency)}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <p className="asset-note">
        Estimates are entered by you and are for personal planning. Keep
        purchase receipts and consult your insurer for coverage requirements.
      </p>
    </main>
  );
}
