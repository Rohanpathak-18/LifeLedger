import mongoose from 'mongoose';

const maintenanceTaskSchema = new mongoose.Schema(
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
    title: { type: String, trim: true, required: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    dueDate: { type: Date, required: true },
    recurrence: {
      type: String,
      enum: ['none', 'monthly', 'quarterly', 'yearly'],
      default: 'none',
    },
    status: { type: String, enum: ['open', 'completed'], default: 'open' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

maintenanceTaskSchema.index({ userId: 1, status: 1, dueDate: 1 });
export default mongoose.model('MaintenanceTask', maintenanceTaskSchema);
