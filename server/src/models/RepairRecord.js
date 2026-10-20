import mongoose from 'mongoose';

const repairRecordSchema = new mongoose.Schema(
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
    serviceDate: { type: Date, required: true },
    provider: { type: String, trim: true, maxlength: 120, default: '' },
    description: { type: String, trim: true, required: true, maxlength: 1000 },
    cost: { type: Number, min: 0, default: null },
    currency: {
      type: String,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: 'USD',
    },
  },
  { timestamps: true },
);

repairRecordSchema.index({ userId: 1, serviceDate: -1 });
export default mongoose.model('RepairRecord', repairRecordSchema);
