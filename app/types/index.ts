export interface User {
  _id: string;
  name: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  _id: string;
  donorId: string;
  title: string;
  description: string;
  category: 'bakery' | 'fruit-veg' | 'dairy' | 'cooked' | 'other';
  quantity: string;
  servesCount: string;
  photoUrl: string;
  borough: string;
  fullAddress?: string;
  coords: { lat: number; lng: number };
  pickupDate: string;
  pickupFrom: string;
  pickupUntil: string;
  expiryDate: string;
  status: 'available' | 'claimed' | 'pending-confirmation' | 'completed' | 'expired';
  claimedBy: string | null;
  claimedAt: string | null;
  acceptsDonations: boolean;
  donorAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exchange {
  _id: string;
  listingId: string;
  donorId: string;
  recipientId: string;
  claimedAt: string;
  donorMarkedCollectedAt: string | null;
  recipientConfirmedAt: string | null;
  status: 'active' | 'pending-confirmation' | 'completed' | 'auto-completed';
  donationAmount: number | null;
  donationAnonymous: boolean;
  donorRating: number | null;
  donorRatingComment: string | null;
  recipientRating: number | null;
  recipientRatingComment: string | null;
  createdAt: string;
}

export interface Message {
  _id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type:
    | 'listing-claimed'
    | 'claim-confirmed'
    | 'new-food-nearby'
    | 'message-received'
    | 'pickup-reminder'
    | 'pickup-completed'
    | 'listing-expiring'
    | 'listing-expired'
    | 'donation-received';
  title: string;
  body: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
