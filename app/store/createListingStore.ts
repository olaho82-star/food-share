import { create } from 'zustand';
import { Listing } from '../types';

interface Step1Data {
  photoUri: string;
  title: string;
  category: Listing['category'] | '';
  quantity: string;
  servesCount: string;
  description: string;
}

interface Step2Data {
  borough: string;
  fullAddress: string;
  pickupDate: Date;
  pickupFrom: string;
  pickupUntil: string;
  expiryDate: Date;
  acceptsDonations: boolean;
  donorAnonymous: boolean;
}

interface CreateListingState extends Step1Data, Step2Data {
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  reset: () => void;
}

const defaults: Step1Data & Step2Data = {
  photoUri: '',
  title: '',
  category: '',
  quantity: '',
  servesCount: '',
  description: '',
  borough: '',
  fullAddress: '',
  pickupDate: new Date(),
  pickupFrom: '12:00',
  pickupUntil: '18:00',
  expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  acceptsDonations: false,
  donorAnonymous: false,
};

export const useCreateListingStore = create<CreateListingState>((set) => ({
  ...defaults,
  setStep1: (data) => set(data),
  setStep2: (data) => set(data),
  reset: () => set(defaults),
}));
