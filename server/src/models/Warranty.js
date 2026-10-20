import mongoose from 'mongoose';

const warrantySchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    provider: { type: String, trim: true, maxlength: 120, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    reference: { type: String, trim: true, maxlength: 160, default: '' },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

warrantySchema.index({ userId: 1, endDate: 1 });
export default mongoose.model('Warranty', warrantySchema);
