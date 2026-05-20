import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  RoleSelection: undefined;
  SignUp: { role: 'donor' | 'recipient' };
  SignIn: undefined;
  ForgotPassword: undefined;
  ResetSent: { email: string };
};

export type DonorHomeStackParamList = {
  MyListings: undefined;
  CreateStep1: undefined;
  CreateStep2: undefined;
  CreateStep3: undefined;
  ListingSuccess: undefined;
  MarkCollected: { listingId: string };
};

export type RecipientHomeStackParamList = {
  HomeMap: undefined;
  ListingDetail: { listingId: string };
  ClaimConfirmed: { listingId: string };
  VoluntaryDonation: { exchangeId: string };
  RateExchange: { exchangeId: string };
};

export type MessagesStackParamList = {
  MessageInbox: undefined;
  ChatThread: { listingId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  CommunityGuidelines: undefined;
  Premium: undefined;
  Support: undefined;
  DeleteAccount: undefined;
};

export type DonorTabParamList = {
  DonorHomeTab: NavigatorScreenParams<DonorHomeStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  PostFoodTab: NavigatorScreenParams<DonorHomeStackParamList>;
  AlertsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RecipientTabParamList = {
  RecipientHomeTab: NavigatorScreenParams<RecipientHomeStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  MyClaimsTab: undefined;
  AlertsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  DonorTabs: NavigatorScreenParams<DonorTabParamList>;
  RecipientTabs: NavigatorScreenParams<RecipientTabParamList>;
};
