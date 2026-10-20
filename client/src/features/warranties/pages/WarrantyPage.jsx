import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../products/services/product.service.js';
import { warrantyService } from '../warranty.service.js';
import WarrantyForm from '../components/WarrantyForm.jsx';

function warrantyStatus(endDate) {
  if (!endDate) return { label: 'Date unknown', className: 'unknown' };
  const days = Math.ceil(
    (new Date(endDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      86400000,
  );
  if (days < 0) return { label: 'Expired', className: 'expired' };
  if (days <= 30)
    return {
      label: days === 0 ? 'Ends today' : `Ends in ${days} days`,
      className: 'warning',
    };
  return { label: 'Active', className: 'active' };
}

export default function WarrantyPage() {
  const [searchParams] = useSearchParams();
  const [warranties, setWarranties] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(
    Boolean(searchParams.get('productId')),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [warrantyItems, productResult] = await Promise.all([
        warrantyService.list(),
        productService.list({ limit: 100 }),
      ]);
      setWarranties(warrantyItems);
      setProducts(productResult.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          'Could not load warranty records.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(values) {
    try {
      if (editing) await warrantyService.update(editing._id, values);
      else await warrantyService.create(values);
      toast.success(editing ? 'Warranty updated.' : 'Warranty added.');
      setEditing(null);
      setFormOpen(false);
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not save this warranty.',
      );
      throw requestError;
    }
  }

  async function remove(warranty) {
    if (
      !window.confirm(
        `Delete the warranty record for ${warranty.productId.name}?`,
      )
    )
      return;
    try {
      await warrantyService.remove(warranty._id);
      toast.success('Warranty removed.');
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not delete this warranty.',
      );
    }
  }

  const selectedProductId = searchParams.get('productId') || '';

  return (
    <main className="main-content warranty-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">DATES YOU CAN COUNT ON</span>
          <h1>
            Warranty tracker,
            <br />
            <em>peace of mind included.</em>
          </h1>
          <p>
            Keep coverage dates and provider details with the things they
            protect.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          disabled={!products.length}
        >
          <Plus size={16} /> Add warranty
        </button>
      </div>
      {formOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="form-panel modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warranty-form-title"
          >
            <div className="modal-heading">
              <div>
                <span className="section-kicker">COVERAGE RECORD</span>
                <h2 id="warranty-form-title">
                  {editing ? 'Edit warranty' : 'Add a warranty'}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {products.length ? (
              <WarrantyForm
                products={products}
                warranty={editing}
                selectedProductId={selectedProductId}
                onSubmit={save}
                onCancel={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              />
            ) : (
              <div className="inventory-empty compact-empty">
                <p>Add a product before creating a warranty record.</p>
                <Link className="primary-button" to="/products/new">
                  Add a product
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
      {error && (
        <div className="inline-error" role="alert">
          {error} <button onClick={load}>Try again</button>
        </div>
      )}
      {loading ? (
        <p className="muted-copy">Loading warranties…</p>
      ) : !error && warranties.length ? (
        <div className="warranty-list">
          {warranties.map((warranty) => {
            const status = warrantyStatus(warranty.endDate);
            return (
              <article className="warranty-row" key={warranty._id}>
                <span className="warranty-icon">
                  <ShieldCheck size={20} />
                </span>
                <div className="warranty-product">
                  <Link to={`/products/${warranty.productId._id}`}>
                    <strong>{warranty.productId.name}</strong>
                  </Link>
                  <span>
                    {warranty.provider || 'Provider not recorded'}
                    {warranty.productId.brand
                      ? ` · ${warranty.productId.brand}`
                      : ''}
                  </span>
                </div>
                <div className="warranty-dates">
                  <CalendarClock size={15} />
                  <span>
                    {warranty.endDate
                      ? `Until ${new Date(warranty.endDate).toLocaleDateString()}`
                      : 'No end date recorded'}
                  </span>
                </div>
                <span className={`warranty-status ${status.className}`}>
                  <i />
                  {status.label}
                </span>
                <div className="warranty-actions">
                  <button
                    className="icon-button"
                    onClick={() => {
                      setEditing(warranty);
                      setFormOpen(true);
                    }}
                    aria-label="Edit warranty"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button danger-action"
                    onClick={() => remove(warranty)}
                    aria-label="Delete warranty"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        !error && (
          <div className="inventory-empty">
            <span className="dashboard-empty-icon">
              <ShieldCheck size={22} />
            </span>
            <h2>No warranty records yet</h2>
            <p>
              Add coverage dates to see what is active and what is coming up.
            </p>
            <button
              className="primary-button"
              onClick={() => setFormOpen(true)}
              disabled={!products.length}
            >
              <Plus size={15} /> Add warranty
            </button>
            {!products.length && (
              <Link className="empty-link" to="/products/new">
                Add a product first
              </Link>
            )}
          </div>
        )
      )}
    </main>
  );
}
