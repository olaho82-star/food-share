import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'listing-claimed'
  | 'claim-confirmed'
  | 'new-food-nearby'
  | 'message-received'
  | 'pickup-reminder'
  | 'pickup-completed'
  | 'listing-expiring'
  | 'listing-expired'
  | 'donation-received';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId: string | null;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'listing-claimed', 'claim-confirmed', 'new-food-nearby', 'message-received',
        'pickup-reminder', 'pickup-completed', 'listing-expiring', 'listing-expired',
        'donation-received',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: String, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
