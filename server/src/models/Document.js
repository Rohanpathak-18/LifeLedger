import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['receipt', 'warranty', 'manual', 'repair_invoice', 'other'],
      default: 'other',
    },
    originalFilename: { type: String, required: true, maxlength: 255 },
    mimeType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'application/pdf'],
      required: true,
    },
    sizeBytes: { type: Number, required: true, min: 1 },
    storageKey: { type: String, required: true, unique: true, select: false },
    extractedText: { type: String, maxlength: 20000, default: '' },
    extractedData: {
      productName: { type: String, maxlength: 120, default: '' },
      purchaseDate: { type: Date, default: null },
      purchasePrice: { type: Number, min: 0, default: null },
      currency: { type: String, maxlength: 3, default: '' },
      warrantyPeriod: { type: String, maxlength: 60, default: '' },
    },
  },
  { timestamps: true },
);

documentSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('Document', documentSchema);
