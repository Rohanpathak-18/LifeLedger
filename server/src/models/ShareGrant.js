import mongoose from 'mongoose';

const shareGrantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
  revokedAt: { type: Date, default: null, index: true },
}, { timestamps: true });
shareGrantSchema.index({ productId: 1, recipientId: 1 }, { unique: true });
export default mongoose.model('ShareGrant', shareGrantSchema);
