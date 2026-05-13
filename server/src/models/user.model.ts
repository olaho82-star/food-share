import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'donor' | 'recipient';
  borough: string;
  locationCoords: { lat: number; lng: number };
  rating: number;
  ratingCount: number;
  donationsCount: number;
  collectionsCount: number;
  foodSavedKg: number;
  totalDonationsReceived: number;
  anonymousDonations: boolean;
  searchRadiusMiles: number;
  foodPreferences: string[];
  disclaimerAccepted: boolean;
  expoPushToken?: string | null;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['donor', 'recipient'], required: true },
    borough: { type: String, default: '' },
    locationCoords: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    donationsCount: { type: Number, default: 0 },
    collectionsCount: { type: Number, default: 0 },
    foodSavedKg: { type: Number, default: 0 },
    totalDonationsReceived: { type: Number, default: 0 },
    anonymousDonations: { type: Boolean, default: false },
    searchRadiusMiles: { type: Number, default: 5 },
    foodPreferences: { type: [String], default: [] },
    disclaimerAccepted: { type: Boolean, required: true },
    expoPushToken: { type: String, default: null },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
