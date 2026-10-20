import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from '../components/ProductForm.jsx';
import { productService } from '../services/product.service.js';

export default function ProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;
    productService
      .get(productId)
      .then(({ product: result }) => {
        setProduct({
          ...result,
          purchaseDate: result.purchaseDate
            ? new Date(result.purchaseDate).toISOString().slice(0, 10)
            : '',
          purchasePrice: result.purchasePrice ?? '',
        });
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.error?.message ||
            'Could not load this product.',
        ),
      )
      .finally(() => setLoading(false));
  }, [productId]);

  async function save(values) {
    const result = await (productId
      ? productService.update(productId, values)
      : productService.create(values));
    toast.success(
      productId ? 'Product updated.' : 'Product added to your collection.',
    );
    navigate(`/products/${result._id}`);
  }

  if (loading)
    return (
      <main className="main-content">
        <p>Loading product…</p>
      </main>
    );
  if (error)
    return (
      <main className="main-content">
        <div className="inline-error">
          {error} <Link to="/products">Back to collection</Link>
        </div>
      </main>
    );

  return (
    <main className="main-content form-page">
      <Link
        to={productId ? `/products/${productId}` : '/products'}
        className="back-link"
      >
        <ArrowLeft size={15} /> Back to {productId ? 'item' : 'collection'}
      </Link>
      <span className="section-kicker">
        {productId ? 'KEEP THE DETAILS CURRENT' : 'A NEW PIECE OF YOUR STORY'}
      </span>
      <h1>
        {productId ? 'Edit your item' : 'Add to your collection'}
        <br />
        <em>the details worth keeping.</em>
      </h1>
      <section className="form-panel">
        <ProductForm
          initialValues={product || undefined}
          onSubmit={save}
          submitLabel={productId ? 'Save changes' : 'Add item'}
        />
      </section>
    </main>
  );
}
