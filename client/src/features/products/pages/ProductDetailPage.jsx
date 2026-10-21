import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  Pencil,
  ShieldCheck,
  Trash2,
  UsersRound,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import QrLabel from '../components/QrLabel.jsx';
import { productService } from '../services/product.service.js';
import { documentService } from '../../documents/document.service.js';

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not recorded';
}

function formatMoney(amount, currency) {
  if (amount == null) return 'Not recorded';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    productService
      .get(productId)
      .then(setRecord)
      .catch((requestError) =>
        setError(
          requestError.response?.data?.error?.message ||
            'Could not load this item.',
        ),
      );
    documentService
      .list()
      .then((rows) => setDocuments(rows.filter((doc) => String(doc.productId?._id) === productId)))
      .catch(() => setDocuments([]));
  }, [productId]);

  async function archive() {
    try {
      await productService.archive(productId);
      toast.success('Item archived.');
      navigate('/products');
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not archive this item.',
      );
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Permanently delete ${record.product.name} and its warranty records?`,
      )
    )
      return;
    try {
      await productService.remove(productId);
      toast.success('Item deleted.');
      navigate('/products');
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not delete this item.',
      );
    }
  }

  if (error)
    return (
      <main className="main-content">
        <div className="inline-error">
          {error} <Link to="/products">Back to collection</Link>
        </div>
      </main>
    );
  if (!record)
    return (
      <main className="main-content">
        <p>Loading item…</p>
      </main>
    );

  const { product, warranties } = record;
  const details = [
    ['Category', product.category],
    ['Brand', product.brand],
    ['Model', product.model],
    ['Serial number', product.serialNumber],
    ['Purchased', formatDate(product.purchaseDate)],
    ['Price', formatMoney(product.purchasePrice, product.currency)],
    [
      'Estimated current value',
      formatMoney(product.currentValue, product.currency),
    ],
    [
      'Replacement cost',
      formatMoney(product.replacementCost, product.currency),
    ],
    ['Location', product.location],
    ['Seller', product.seller],
  ];

  return (
    <main className="main-content detail-page">
      <Link to="/products" className="back-link">
        <ArrowLeft size={15} /> Back to collection
      </Link>
      <div className="detail-heading">
        <div>
          <span className="section-kicker">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{[product.brand, product.model].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="detail-actions">
          {record.accessRole !== 'viewer' && <Link to={`/products/${productId}/edit`} className="secondary-button">
            <Pencil size={15} /> Edit
          </Link>}
          {record.accessRole === 'owner' && <button className="secondary-button" onClick={archive}>
            <Archive size={15} /> Archive
          </button>}
          {record.accessRole === 'owner' && <button className="secondary-button danger-action" onClick={remove}>
            <Trash2 size={15} /> Delete
          </button>}
          {record.accessRole === 'owner' && <Link className="secondary-button" to={`/family?productId=${productId}`}><UsersRound size={15}/> Share</Link>}
        </div>
      </div>
      <QrLabel productId={productId} productName={product.name} />
      <section className="detail-panel">
        <h2>Purchase details</h2>
        <dl className="detail-grid">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || 'Not recorded'}</dd>
            </div>
          ))}
        </dl>
        {product.notes && (
          <div className="detail-notes">
            <span>NOTES</span>
            <p>{product.notes}</p>
          </div>
        )}
      </section>
      <section className="detail-panel"><div className="section-heading"><div><span className="section-kicker">RECEIPTS AND RECORDS</span><h2>Documents</h2></div><Link to="/documents" className="text-link">All documents <FileText size={14}/></Link></div>{documents.length ? <div className="detail-warranty-list">{documents.map((doc) => <div className="detail-warranty" key={doc._id}><FileText size={17}/><div><strong>{doc.originalFilename}</strong><span>{doc.type.replace('_', ' ')}</span></div><button className="secondary-button" onClick={() => documentService.download(doc._id, doc.originalFilename).catch(() => toast.error('Could not download this file.'))}>Download</button></div>)}</div> : <p className="muted-copy">No documents are linked to this item yet.</p>}</section>
      <section className="detail-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COVERAGE YOU HAVE ON RECORD</span>
            <h2>Warranties</h2>
          </div>
          {record.accessRole === 'owner' && <Link to={`/warranties?productId=${productId}`} className="text-link">
            <ShieldCheck size={14} /> Add warranty
          </Link>}
        </div>
        {warranties.length ? (
          <div className="detail-warranty-list">
            {warranties.map((item) => (
              <div key={item._id} className="detail-warranty">
                <ShieldCheck size={18} />
                <div>
                  <strong>{item.provider || 'Warranty'}</strong>
                  <span>
                    {item.endDate
                      ? `Until ${formatDate(item.endDate)}`
                      : 'End date not recorded'}
                  </span>
                </div>
                <CalendarDays size={16} />
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            No warranty details recorded for this item.
          </p>
        )}
      </section>
    </main>
  );
}
