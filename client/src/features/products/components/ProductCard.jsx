import {
  Archive,
  ArrowUpRight,
  Boxes,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../services/product.service.js';

const money = (amount, currency) => {
  if (amount == null) return 'Price not set';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export default function ProductCard({ product, onChanged }) {
  async function act(action) {
    try {
      if (action === 'archive') await productService.archive(product._id);
      if (action === 'delete') {
        if (
          !window.confirm(
            `Permanently delete ${product.name} and its warranty records?`,
          )
        )
          return;
        await productService.remove(product._id);
      }
      toast.success(action === 'archive' ? 'Item archived.' : 'Item deleted.');
      onChanged?.();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Could not update this item.',
      );
    }
  }

  return (
    <article className="inventory-card">
      <Link className="inventory-card-main" to={`/products/${product._id}`}>
        <div className="inventory-visual">
          <span className="product-category">{product.category}</span>
          <Boxes size={32} strokeWidth={1.2} />
          <ArrowUpRight className="inventory-card-arrow" size={16} />
        </div>
        <div className="product-info">
          <div className="product-copy">
            <h3>{product.name}</h3>
            <p>
              {[product.brand, product.model].filter(Boolean).join(' · ') ||
                'Brand and model not set'}
            </p>
          </div>
        </div>
      </Link>
      <div className="inventory-card-meta">
        <span>
          {product.purchaseDate
            ? new Date(product.purchaseDate).toLocaleDateString()
            : 'Purchase date not set'}
        </span>
        <strong>
          {money(product.purchasePrice, product.currency || 'USD')}
        </strong>
      </div>
      <details className="card-actions">
        <summary aria-label={`Actions for ${product.name}`}>
          <MoreHorizontal size={17} />
        </summary>
        <div className="card-menu">
          <Link to={`/products/${product._id}/edit`}>
            <Pencil size={14} /> Edit
          </Link>
          <button onClick={() => act('archive')}>
            <Archive size={14} /> Archive
          </button>
          <button className="danger-action" onClick={() => act('delete')}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </details>
    </article>
  );
}
