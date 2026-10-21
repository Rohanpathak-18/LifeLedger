import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { productSchema } from '../product.validation.js';

const categories = [
  'Electronics',
  'Home appliances',
  'Furniture',
  'Vehicles and accessories',
  'Tools and equipment',
  'Other',
];

const defaults = {
  name: '',
  brand: '',
  model: '',
  serialNumber: '',
  category: 'Electronics',
  purchaseDate: '',
  purchasePrice: '',
  currentValue: '',
  replacementCost: '',
  location: '',
  currency: 'USD',
  seller: '',
  notes: '',
};

export default function ProductForm({
  initialValues = defaults,
  onSubmit,
  submitLabel,
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues,
  });

  useEffect(
    () => reset({ ...defaults, ...initialValues }),
    [initialValues, reset],
  );

  async function save(values) {
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Could not save this product.',
      );
      setSaving(false);
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit(save)}>
      <label className="form-wide">
        Item name{' '}
        <input
          autoFocus
          {...register('name')}
          placeholder="e.g. Coffee machine"
        />
        {errors.name && <small>{errors.name.message}</small>}
      </label>
      <label>
        Category{' '}
        <select {...register('category')}>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        Brand <input {...register('brand')} placeholder="Brand" />
      </label>
      <label>
        Model <input {...register('model')} placeholder="Model or version" />
      </label>
      <label>
        Serial number{' '}
        <input {...register('serialNumber')} placeholder="Optional" />
      </label>
      <label>
        Purchase date <input type="date" {...register('purchaseDate')} />
      </label>
      <div className="price-field">
        <label>
          Purchase price
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('purchasePrice')}
            placeholder="Optional"
          />
          {errors.purchasePrice && (
            <small>{errors.purchasePrice.message}</small>
          )}
        </label>
        <label>
          Currency
          <input maxLength="3" {...register('currency')} />
        </label>
      </div>
      <label className="form-wide">
        Seller <input {...register('seller')} placeholder="Store or seller" />
      </label>
      <label>
        Estimated current value{' '}
        <input type="number" min="0" step="0.01" {...register('currentValue')} placeholder="Optional" />
      </label>
      <label>
        Replacement cost{' '}
        <input type="number" min="0" step="0.01" {...register('replacementCost')} placeholder="Optional" />
      </label>
      <label className="form-wide">
        Where it lives <input {...register('location')} placeholder="e.g. Hall closet, top shelf" />
      </label>
      <label className="form-wide">
        Notes{' '}
        <textarea
          rows="4"
          {...register('notes')}
          placeholder="Anything useful to remember about this item"
        />
      </label>
      <div className="form-actions form-wide">
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
