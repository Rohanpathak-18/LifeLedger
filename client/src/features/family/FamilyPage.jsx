import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  LockKeyhole,
  Plus,
  Shield,
  Trash2,
  UsersRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../products/services/product.service.js';
import { familyService } from './family.service.js';

export default function FamilyPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ sent: [], received: [] });
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const [productId, setProductId] = useState(
    searchParams.get('productId') || '',
  );
  const [role, setRole] = useState('viewer');
  const [emergency, setEmergency] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const [shares, secure, collection] = await Promise.all([
        familyService.list(),
        familyService.readEmergency(),
        productService.list({ limit: 100 }),
      ]);
      setData(shares);
      setEmergency(secure.information);
      setProducts(collection.data);
    } catch {
      toast.error('Your household space could not be loaded.');
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function share(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await familyService.share({ email, productId, role });
      setEmail('');
      setProductId('');
      await load();
      toast.success('Private item access shared.');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Could not share this item.',
      );
    } finally {
      setSaving(false);
    }
  }
  async function revoke(item) {
    try {
      await familyService.revoke(item._id);
      await load();
      toast.success('Access revoked.');
    } catch {
      toast.error('Could not revoke access.');
    }
  }
  async function saveEmergency(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await familyService.saveEmergency(emergency);
      toast.success('Emergency information saved securely.');
    } catch {
      toast.error('Could not save emergency information.');
    } finally {
      setSaving(false);
    }
  }
  const activeSent = data.sent.filter((item) => !item.revokedAt);
  const activeReceived = data.received.filter((item) => item.productId);
  return (
    <main className="main-content family-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">A LITTLE MORE, HELD TOGETHER</span>
          <h1>
            Your household, <em>in good hands.</em>
          </h1>
          <p>
            Share selected item records with people you trust, and keep a
            private note for an emergency.
          </p>
        </div>
      </div>
      <div className="family-grid">
        <section className="form-panel family-share-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">PRIVATE, ITEM BY ITEM</span>
              <h2>Share an item</h2>
            </div>
            <UsersRound size={19} />
          </div>
          <form className="record-form family-form" onSubmit={share}>
            <label className="form-wide">
              Recipient email
              <input
                type="email"
                required
                maxLength="254"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="family@example.com"
              />
            </label>
            <label className="form-wide">
              Item record
              <select
                required
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                <option value="">Choose from your collection</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-wide">
              Permission
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="viewer">Viewer · can view and download</option>
                <option value="editor">Editor · can update item details</option>
              </select>
            </label>
            <div className="form-actions form-wide">
              <button className="primary-button" disabled={saving}>
                <Plus size={14} /> {saving ? 'Sharing…' : 'Share privately'}
              </button>
            </div>
          </form>
          <p className="upload-note">
            The recipient must have a LifeLedger account. Their access requires
            sign-in and can be revoked here.
          </p>
        </section>
        <section className="form-panel emergency-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">ONLY YOU CAN READ THIS</span>
              <h2>Emergency information</h2>
            </div>
            <LockKeyhole size={19} />
          </div>
          <p className="muted-copy">
            Keep a concise note such as an emergency contact or where essential
            records are stored. This note is encrypted before it is saved.
          </p>
          <form onSubmit={saveEmergency}>
            <label className="emergency-input">
              Private note
              <textarea
                rows="6"
                maxLength="10000"
                value={emergency}
                onChange={(event) => setEmergency(event.target.value)}
                placeholder="Emergency contact, essential information, or where your important records can be found"
              />
            </label>
            <button className="primary-button" disabled={saving}>
              <LockKeyhole size={14} /> Save encrypted note
            </button>
          </form>
        </section>
      </div>
      <section className="family-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ACCESS YOU HAVE GIVEN</span>
            <h2>Shared with family</h2>
          </div>
          <span className="results-summary">{activeSent.length} active</span>
        </div>
        {activeSent.length ? (
          <div className="family-share-list">
            {activeSent.map((item) => (
              <article className="family-share-row" key={item._id}>
                <span className="timeline-icon">
                  <Shield size={16} />
                </span>
                <div>
                  <strong>{item.productId?.name || 'Item record'}</strong>
                  <small>
                    {item.recipientId?.name || item.recipientId?.email} ·{' '}
                    {item.role}
                  </small>
                </div>
                <button
                  className="secondary-button danger-action"
                  onClick={() => revoke(item)}
                >
                  <Trash2 size={14} /> Revoke
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="inventory-empty">
            <h2>No items shared yet</h2>
            <p>
              Choose a record above to share just the details your household
              needs.
            </p>
          </div>
        )}
      </section>
      <section className="family-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR HOUSEHOLD RECORDS</span>
            <h2>Shared with you</h2>
          </div>
          <span className="results-summary">{activeReceived.length} items</span>
        </div>
        {activeReceived.length ? (
          <div className="family-share-list">
            {activeReceived.map((item) => (
              <Link
                className="family-share-row family-link"
                key={item._id}
                to={`/products/${item.productId._id}`}
              >
                <span className="timeline-icon">
                  <UsersRound size={16} />
                </span>
                <div>
                  <strong>{item.productId.name}</strong>
                  <small>
                    {item.ownerId?.name || 'A family member'} · {item.role}
                  </small>
                </div>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="inventory-empty">
            <h2>No shared records yet</h2>
            <p>Items a family member shares with you will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
