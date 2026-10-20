import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z
  .object({
    productId: z.string().min(1, 'Choose a product'),
    provider: z.string().trim().max(120),
    startDate: z.string(),
    endDate: z.string(),
    reference: z.string().trim().max(160),
    notes: z.string().trim().max(2000),
  })
  .refine(
    (value) =>
      !value.startDate || !value.endDate || value.startDate <= value.endDate,
    {
      path: ['endDate'],
      message: 'End date must be on or after start date',
    },
  );

const defaults = {
  productId: '',
  provider: '',
  startDate: '',
  endDate: '',
  reference: '',
  notes: '',
};
const dateValue = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

export default function WarrantyForm({
  products,
  warranty,
  selectedProductId,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaults,
      productId: selectedProductId || warranty?.productId?._id || '',
      provider: warranty?.provider || '',
      startDate: dateValue(warranty?.startDate),
      endDate: dateValue(warranty?.endDate),
      reference: warranty?.reference || '',
      notes: warranty?.notes || '',
    },
  });

  useEffect(
    () =>
      reset({
        ...defaults,
        productId: selectedProductId || warranty?.productId?._id || '',
        provider: warranty?.provider || '',
        startDate: dateValue(warranty?.startDate),
        endDate: dateValue(warranty?.endDate),
        reference: warranty?.reference || '',
        notes: warranty?.notes || '',
      }),
    [reset, selectedProductId, warranty],
  );

  return (
    <form
      className="record-form warranty-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="form-wide">
        Product{' '}
        <select disabled={Boolean(warranty)} {...register('productId')}>
          <option value="">Choose an item</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        {errors.productId && <small>{errors.productId.message}</small>}
      </label>
      <label className="form-wide">
        Warranty provider{' '}
        <input {...register('provider')} placeholder="Manufacturer or seller" />
      </label>
      <label>
        Start date <input type="date" {...register('startDate')} />
        {errors.startDate && <small>{errors.startDate.message}</small>}
      </label>
      <label>
        End date <input type="date" {...register('endDate')} />
        {errors.endDate && <small>{errors.endDate.message}</small>}
      </label>
      <label className="form-wide">
        Reference{' '}
        <input
          {...register('reference')}
          placeholder="Optional claim or registration number"
        />
      </label>
      <label className="form-wide">
        Notes{' '}
        <textarea
          rows="3"
          {...register('notes')}
          placeholder="Coverage notes"
        />
      </label>
      <div className="form-actions form-wide">
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving…'
            : warranty
              ? 'Save warranty'
              : 'Add warranty'}
        </button>
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
