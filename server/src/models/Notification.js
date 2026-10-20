import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['activity', 'warranty'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 140 },
    message: { type: String, required: true, maxlength: 500 },
    href: { type: String, required: true, maxlength: 300 },
    readAt: { type: Date, default: null },
    dedupeKey: { type: String, default: null, select: false },
    emailSentAt: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } },
);

export default mongoose.model('Notification', notificationSchema);
