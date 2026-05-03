import mongoose, { Schema, Document } from 'mongoose';

export interface IExchange extends Document {
  listingId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  claimedAt: Date;
  donorMarkedCollectedAt: Date | null;
  recipientConfirmedAt: Date | null;
  status: 'active' | 'pending-confirmation' | 'completed' | 'auto-completed';
  donationAmount: number | null;
  donationAnonymous: boolean;
  donorRating: number | null;
  donorRatingComment: string | null;
  recipientRating: number | null;
  recipientRatingComment: string | null;
}

const exchangeSchema = new Schema<IExchange>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    claimedAt: { type: Date, required: true },
    donorMarkedCollectedAt: { type: Date, default: null },
    recipientConfirmedAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'pending-confirmation', 'completed', 'auto-completed'], default: 'active' },
    donationAmount: { type: Number, default: null },
    donationAnonymous: { type: Boolean, default: false },
    donorRating: { type: Number, default: null },
    donorRatingComment: { type: String, default: null },
    recipientRating: { type: Number, default: null },
    recipientRatingComment: { type: String, default: null },
  },
  { timestamps: true }
);

exchangeSchema.index({ donorId: 1, status: 1 });
exchangeSchema.index({ recipientId: 1, status: 1 });
exchangeSchema.index({ listingId: 1 }, { unique: true });

export const Exchange = mongoose.model<IExchange>('Exchange', exchangeSchema);
