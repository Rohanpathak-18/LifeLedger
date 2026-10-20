import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Archive, Boxes, Plus, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { productService } from '../services/product.service.js';

const categories = [
  'All categories',
  'Electronics',
  'Home appliances',
  'Furniture',
  'Vehicles and accessories',
  'Tools and equipment',
  'Other',
];

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [archived, setArchived] = useState(false);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearchParams(search ? { search } : {}),
      250,
    );
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    productService
      .list({
        page: pagination.page,
        limit: 12,
        search: searchParams.get('search') || '',
        category,
        sort,
        archived,
      })
      .then((result) => {
        if (cancelled) return;
        setItems(result.data);
        setPagination(result.pagination);
      })
      .catch((requestError) => {
        if (!cancelled)
          setError(
            requestError.response?.data?.error?.message ||
              'Could not load your collection.',
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, category, sort, archived, pagination.page, reload]);

  function changeCategory(value) {
    setCategory(value === 'All categories' ? '' : value);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  return (
    <main className="main-content collection-page">
      <div className="collection-page-heading">
        <div>
          <span className="section-kicker">THE THINGS YOU KEEP</span>
          <h1>
            Your collection,
            <br />
            <em>all in one place.</em>
          </h1>
          <p>Keep the details, dates, and costs that matter close at hand.</p>
        </div>
        <Link to="/products/new" className="primary-button">
          <Plus size={16} /> Add an item
        </Link>
      </div>
      <div className="collection-controls">
        <label className="collection-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
            placeholder="Search name, brand, or model"
          />
        </label>
        <label className="filter-select">
          <span>Category</span>
          <select
            value={category || 'All categories'}
            onChange={(event) => changeCategory(event.target.value)}
          >
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="recent">Recently updated</option>
            <option value="name">Name</option>
            <option value="purchaseDate">Purchase date</option>
            <option value="price">Purchase price</option>
          </select>
        </label>
        <button
          className={`archive-toggle ${archived ? 'is-active' : ''}`}
          onClick={() => {
            setArchived((value) => !value);
            setPagination((current) => ({ ...current, page: 1 }));
          }}
        >
          <Archive size={15} /> {archived ? 'Archived' : 'Active items'}
        </button>
      </div>
      <div className="results-summary">
        {loading
          ? 'Loading your collection…'
          : `${pagination.total} ${pagination.total === 1 ? 'item' : 'items'}${archived ? ' archived' : ''}`}
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}{' '}
          <button onClick={() => setReload((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="inventory-grid">
          {items.map((item) => (
            <ProductCard
              key={item._id}
              product={item}
              onChanged={() => setReload((value) => value + 1)}
            />
          ))}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="inventory-empty">
          <span className="dashboard-empty-icon">
            <Boxes size={22} />
          </span>
          <h2>
            {search || category
              ? 'Nothing matches those filters'
              : archived
                ? 'No archived items'
                : 'Your collection starts here'}
          </h2>
          <p>
            {search || category
              ? 'Try another search or category.'
              : archived
                ? 'Items you archive will be kept here.'
                : 'Add a product to keep its purchase details and warranty dates together.'}
          </p>
          {!search && !category && !archived && (
            <Link to="/products/new" className="primary-button">
              <Plus size={15} /> Add your first item
            </Link>
          )}
        </div>
      )}
      {pagination.totalPages > 1 && (
        <div className="pagination-row">
          <button
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: current.page - 1,
              }))
            }
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: current.page + 1,
              }))
            }
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
