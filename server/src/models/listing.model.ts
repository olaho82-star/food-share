import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  donorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'bakery' | 'fruit-veg' | 'dairy' | 'cooked' | 'other';
  quantity: string;
  servesCount: string;
  photoUrl: string;
  borough: string;
  fullAddress: string;
  coords: { lat: number; lng: number };
  pickupDate: Date;
  pickupFrom: string;
  pickupUntil: string;
  expiryDate: Date;
  status: 'available' | 'claimed' | 'pending-confirmation' | 'completed' | 'expired';
  claimedBy: mongoose.Types.ObjectId | null;
  claimedAt: Date | null;
  acceptsDonations: boolean;
  donorAnonymous: boolean;
}

const listingSchema = new Schema<IListing>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['bakery', 'fruit-veg', 'dairy', 'cooked', 'other'], required: true },
    quantity: { type: String, required: true },
    servesCount: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    borough: { type: String, required: true },
    fullAddress: { type: String, required: true },
    coords: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
    pickupDate: { type: Date, required: true },
    pickupFrom: { type: String, required: true },
    pickupUntil: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['available', 'claimed', 'pending-confirmation', 'completed', 'expired'], default: 'available' },
    claimedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
    acceptsDonations: { type: Boolean, default: false },
    donorAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

listingSchema.index({ coords: '2dsphere' });
listingSchema.index({ donorId: 1, status: 1 });

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
