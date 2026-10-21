import mongoose from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Home appliances',
  'Furniture',
  'Vehicles and accessories',
  'Tools and equipment',
  'Other',
];

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    brand: { type: String, trim: true, maxlength: 100, default: '' },
    model: { type: String, trim: true, maxlength: 100, default: '' },
    serialNumber: { type: String, trim: true, maxlength: 120, default: '' },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      default: 'Other',
      index: true,
    },
    purchaseDate: { type: Date, default: null },
    purchasePrice: { type: Number, min: 0, default: null },
    currentValue: { type: Number, min: 0, default: null },
    replacementCost: { type: Number, min: 0, default: null },
    valueHistory: [{ value: { type: Number, min: 0, required: true }, recordedAt: { type: Date, default: Date.now } }],
    location: { type: String, trim: true, maxlength: 160, default: '' },
    currency: {
      type: String,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: 'USD',
    },
    seller: { type: String, trim: true, maxlength: 120, default: '' },
    notes: { type: String, trim: true, maxlength: 3000, default: '' },
    archivedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

productSchema.index({ userId: 1, archivedAt: 1, updatedAt: -1 });
productSchema.index({ userId: 1, category: 1, archivedAt: 1 });

export default mongoose.model('Product', productSchema);
