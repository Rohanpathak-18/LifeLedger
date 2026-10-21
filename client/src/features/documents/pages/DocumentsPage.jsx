import { useCallback, useEffect, useState } from 'react';
import { FileText, FileUp, Image, Package, Plus, Trash2, ScanText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../document.service.js';
import { productService } from '../../products/services/product.service.js';
import { warrantyService } from '../../warranties/warranty.service.js';
import { extractDocumentText, suggestDetails } from '../ocr.js';

const types = ['receipt', 'warranty', 'manual', 'repair_invoice', 'other'];
const emptyDetails = { productName: '', purchaseDate: '', purchasePrice: '', currency: '', warrantyPeriod: '' };
const FileIcon = ({ type }) => type.startsWith('image/') ? <Image size={19} /> : <FileText size={19} />;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('receipt');
  const [productId, setProductId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('idle');
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [details, setDetails] = useState(emptyDetails);
  const [reviewed, setReviewed] = useState(false);
  const [applyDetails, setApplyDetails] = useState(false);
  const [applyWarranty, setApplyWarranty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [documentRows, productRows] = await Promise.all([documentService.list(), productService.list({ limit: 100 })]);
      setDocuments(documentRows); setProducts(productRows.data);
    } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not load your documents.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function chooseFile(nextFile) {
    setFile(nextFile); setDetails(emptyDetails); setOcrText(''); setReviewed(false); setApplyDetails(false); setApplyWarranty(false);
    if (!nextFile) { setOcrStatus('idle'); return; }
    setOcrStatus('reading'); setOcrProgress('Preparing document…');
    try {
      const text = await extractDocumentText(nextFile, setOcrProgress);
      setOcrText(text);
      setDetails(suggestDetails(text, nextFile.name));
      setOcrStatus(text ? 'ready' : 'empty');
    } catch {
      setDetails({ ...emptyDetails, productName: nextFile.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') });
      setOcrStatus('unavailable');
    }
  }

  function updateDetail(key, value) { setDetails((current) => ({ ...current, [key]: value })); setReviewed(false); }

  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) return toast.error('Choose a JPEG, PNG, or PDF file first.');
    if (!reviewed) return toast.error('Review and confirm the document details before saving.');
    setUploading(true);
    try {
      const extractedData = { ...details, purchasePrice: details.purchasePrice === '' ? '' : Number(details.purchasePrice) };
      await documentService.upload({ file, type, productId, extractedText: ocrText, extractedData });
      if (applyDetails && productId && (details.purchaseDate || details.purchasePrice !== '')) {
        const updates = {};
        if (details.purchaseDate) updates.purchaseDate = details.purchaseDate;
        if (details.purchasePrice !== '') updates.purchasePrice = Number(details.purchasePrice);
        if (details.currency) updates.currency = details.currency;
        try { await productService.update(productId, updates); }
        catch { toast.error('The document was saved, but the item details could not be updated.'); }
      }
      if (applyWarranty && productId) {
        const match = details.warrantyPeriod.match(/(\d+)\s*(year|month)/i);
        if (match) {
          const startDate = details.purchaseDate || new Date().toISOString().slice(0, 10);
          const endDate = new Date(`${startDate}T00:00:00.000Z`);
          if (match[2].toLowerCase() === 'year') endDate.setUTCFullYear(endDate.getUTCFullYear() + Number(match[1]));
          else endDate.setUTCMonth(endDate.getUTCMonth() + Number(match[1]));
          try { await warrantyService.create({ productId, startDate, endDate: endDate.toISOString().slice(0, 10), notes: `From reviewed document: ${file.name} · ${details.warrantyPeriod}` }); }
          catch { toast.error('The document was saved, but the warranty reminder could not be created.'); }
        }
      }
      setFile(null); setOcrText(''); setDetails(emptyDetails); setReviewed(false); setApplyWarranty(false); setProductId(''); setOcrStatus('idle'); form.reset();
      toast.success('Document and reviewed details saved privately.'); await load();
    } catch (requestError) { toast.error(requestError.response?.data?.error?.message || 'Could not upload this document.'); }
    finally { setUploading(false); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.originalFilename}?`)) return;
    try { await documentService.remove(item._id); toast.success('Document deleted.'); await load(); }
    catch (requestError) { toast.error(requestError.response?.data?.error?.message || 'Could not delete this document.'); }
  }

  async function download(item) {
    try { await documentService.download(item._id, item.originalFilename); }
    catch (requestError) { toast.error(requestError.response?.data?.error?.message || 'Could not download this document.'); }
  }

  return <main className="main-content documents-page">
    <div className="collection-page-heading"><div><span className="section-kicker">THE PAPERWORK, KEPT CLOSE</span><h1>Documents,<br/><em>safe and together.</em></h1><p>Read receipts and warranty cards, review the details, then keep them with the right item.</p></div></div>
    <section className="form-panel upload-panel"><div className="section-heading"><div><span className="section-kicker">PRIVATE FILE STORAGE</span><h2>Add a document</h2></div><FileUp size={20}/></div>
      <form className="upload-form" onSubmit={upload}>
        <label className="file-picker"><input type="file" capture="environment" accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf" onChange={(event) => chooseFile(event.target.files?.[0] || null)}/><span><Plus size={15}/> {file ? file.name : 'Scan or choose a JPEG, PNG, or PDF (10 MB max)'}</span></label>
        <label className="filter-select"><span>Document type</span><select value={type} onChange={(event) => setType(event.target.value)}>{types.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label>
        <label className="filter-select"><span>Related product</span><select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">No product selected</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>
        {file && <section className="ocr-review"><div className="ocr-review-heading"><span className="timeline-icon"><ScanText size={17}/></span><div><strong>Review document details</strong><small>{ocrStatus === 'reading' ? ocrProgress : ocrStatus === 'ready' ? 'Text found on this document. Check each field before saving.' : ocrStatus === 'empty' ? 'No text was recognized. Add any details you want to keep.' : ocrStatus === 'unavailable' ? 'Automatic reading is unavailable. You can enter the details by hand.' : 'Check the details before attaching this document.'}</small></div></div>
          <div className="ocr-fields"><label>Product or description<input maxLength="120" value={details.productName} onChange={(event) => updateDetail('productName', event.target.value)}/></label><label>Purchase date<input type="date" value={details.purchaseDate} onChange={(event) => updateDetail('purchaseDate', event.target.value)}/></label><label>Purchase amount<input type="number" min="0" step="0.01" value={details.purchasePrice} onChange={(event) => updateDetail('purchasePrice', event.target.value)} placeholder="Optional"/></label><label>Currency<input maxLength="3" value={details.currency} onChange={(event) => updateDetail('currency', event.target.value.toUpperCase())} placeholder="USD"/></label><label className="ocr-wide">Warranty period<input maxLength="60" value={details.warrantyPeriod} onChange={(event) => updateDetail('warrantyPeriod', event.target.value)} placeholder="e.g. 2 year warranty"/></label></div>
          {ocrText && <details className="ocr-text"><summary>Show recognized text</summary><pre>{ocrText}</pre></details>}
          {productId && <label className="ocr-confirm"><input type="checkbox" checked={applyDetails} onChange={(event) => setApplyDetails(event.target.checked)}/> Also apply the reviewed purchase date and amount to the linked item</label>}
          {productId && /\d+\s*(year|month)/i.test(details.warrantyPeriod) && <label className="ocr-confirm"><input type="checkbox" checked={applyWarranty} onChange={(event) => setApplyWarranty(event.target.checked)}/> Create a warranty reminder for this item using the reviewed term</label>}
          <label className="ocr-confirm"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)}/> I have reviewed these details and want to save them with the document</label>
        </section>}
        <button type="submit" className="primary-button" disabled={uploading || ocrStatus === 'reading' || !file || !reviewed}>{uploading ? 'Saving…' : 'Save reviewed document'}</button>
      </form>
      <p className="upload-note">Text recognition runs in your browser. Your selected document is sent only to your LifeLedger account after you confirm the reviewed details. Scanned PDFs use the first page for text reading.</p>
    </section>
    {error && <div className="inline-error" role="alert">{error}<button onClick={load}>Try again</button></div>}
    <section className="documents-list-section"><div className="section-heading"><div><span className="section-kicker">YOUR PRIVATE ARCHIVE</span><h2>Saved documents</h2></div><span className="results-summary">{loading ? 'Loading…' : `${documents.length} files`}</span></div>
      {!loading && !error && documents.length === 0 ? <div className="inventory-empty"><span className="dashboard-empty-icon"><FileText size={22}/></span><h2>No documents yet</h2><p>Upload a receipt or manual to keep it with your ownership records.</p></div> : <div className="document-list">{documents.map((item) => <article className="document-row" key={item._id}><span className="document-file-icon"><FileIcon type={item.mimeType}/></span><div className="document-copy"><strong>{item.originalFilename}</strong><span>{item.type.replace('_', ' ')} · {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB · {new Date(item.createdAt).toLocaleDateString()}</span></div><span className="document-product"><Package size={13}/>{item.productId?.name || 'Unlinked'}</span><button className="secondary-button" onClick={() => download(item)}><Download size={14}/> Download</button>{item.canDelete && <button className="icon-button danger-action" aria-label="Delete document" onClick={() => remove(item)}><Trash2 size={15}/></button>}</article>)}</div>}
    </section>
  </main>;
}
