import { useCallback, useEffect, useState } from 'react';
import { FileText, FileUp, Image, Package, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../document.service.js';
import { productService } from '../../products/services/product.service.js';

const types = ['receipt', 'warranty', 'manual', 'repair_invoice', 'other'];
const FileIcon = ({ type }) =>
  type.startsWith('image/') ? <Image size={19} /> : <FileText size={19} />;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('receipt');
  const [productId, setProductId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [documentRows, productRows] = await Promise.all([
        documentService.list(),
        productService.list({ limit: 100 }),
      ]);
      setDocuments(documentRows);
      setProducts(productRows.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          'Could not load your documents.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) return toast.error('Choose a JPEG, PNG, or PDF file first.');
    setUploading(true);
    try {
      await documentService.upload({ file, type, productId });
      setFile(null);
      form.reset();
      toast.success('Document uploaded privately.');
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not upload this document.',
      );
    } finally {
      setUploading(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.originalFilename}?`)) return;
    try {
      await documentService.remove(item._id);
      toast.success('Document deleted.');
      await load();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not delete this document.',
      );
    }
  }

  async function download(item) {
    try {
      await documentService.download(item._id, item.originalFilename);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.error?.message ||
          'Could not download this document.',
      );
    }
  }

  return (
    <main className="main-content documents-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">THE PAPERWORK, KEPT CLOSE</span>
          <h1>
            Documents,
            <br />
            <em>safe and together.</em>
          </h1>
          <p>
            Receipts, manuals, and warranty files stay private in your account.
          </p>
        </div>
      </div>
      <section className="form-panel upload-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">PRIVATE FILE STORAGE</span>
            <h2>Add a document</h2>
          </div>
          <FileUp size={20} />
        </div>
        <form className="upload-form" onSubmit={upload}>
          <label className="file-picker">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <span>
              <Plus size={15} />{' '}
              {file ? file.name : 'Choose a JPEG, PNG, or PDF (10 MB max)'}
            </span>
          </label>
          <label className="filter-select">
            <span>Document type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {types.map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>Related product</span>
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              <option value="">No product selected</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="primary-button"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading…' : 'Upload document'}
          </button>
        </form>
        <p className="upload-note">
          Files are private and require your account to download. File contents
          are checked on the server.
        </p>
      </section>
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button onClick={load}>Try again</button>
        </div>
      )}
      <section className="documents-list-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOUR PRIVATE ARCHIVE</span>
            <h2>Saved documents</h2>
          </div>
          <span className="results-summary">
            {loading ? 'Loading…' : `${documents.length} files`}
          </span>
        </div>
        {!loading && !error && documents.length === 0 ? (
          <div className="inventory-empty">
            <span className="dashboard-empty-icon">
              <FileText size={22} />
            </span>
            <h2>No documents yet</h2>
            <p>
              Upload a receipt or manual to keep it with your ownership records.
            </p>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((item) => (
              <article className="document-row" key={item._id}>
                <span className="document-file-icon">
                  <FileIcon type={item.mimeType} />
                </span>
                <div className="document-copy">
                  <strong>{item.originalFilename}</strong>
                  <span>
                    {item.type.replace('_', ' ')} ·{' '}
                    {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB ·{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="document-product">
                  <Package size={13} />
                  {item.productId?.name || 'Unlinked'}
                </span>
                <button
                  className="secondary-button"
                  onClick={() => download(item)}
                >
                  Download
                </button>
                <button
                  className="icon-button danger-action"
                  aria-label="Delete document"
                  onClick={() => remove(item)}
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
