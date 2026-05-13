# CLAUDE.md â€” FoodLodge App

> This file contains the full context, architecture, design decisions, and development instructions for building the FoodLodge mobile app. Any developer or AI assistant working on this project should read this file in full before writing any code.

---

## 1. Project Overview

**App name:** FoodLodge  
**Platform:** iOS and Android (cross-platform)  
**Type:** Mobile app  
**Purpose:** FoodLodge connects individuals and businesses with surplus food to people in need, reducing food waste and supporting communities across London.

### Mission Statement
FoodLodge exists to reduce food waste and support communities across London by making it easy to donate and collect surplus food â€” for free.

---

## 2. Core Constraints & Product Decisions

These are non-negotiable product decisions agreed during design. Do not deviate without explicit instruction.

| Constraint | Decision |
|---|---|
| Geography | London only (MVP). All listings are London-based. |
| Authentication | Email and password only. No social login (Google, Apple etc). |
| User roles | Single role per account â€” either Donor or Recipient. Cannot be both. |
| Role changes | Users must contact support to change their role. Not self-serve. |
| Payments | Food exchanges are always free. No paid transactions. |
| Voluntary donations | Recipients can optionally donate money to donors after collecting food. Amounts are always shown publicly. Donor name can be shown or kept anonymous (donor's preference). |
| Donation amounts | Â£1, Â£5, Â£10, or any custom amount entered by the recipient. |
| Food safety | A food safety disclaimer must be shown at sign-up (with mandatory checkbox) and on every listing detail screen. FoodLodge accepts no liability for illness from food exchanged on the platform. |
| Collection confirmation | Two-way: donor marks collected â†’ recipient confirms â†’ exchange completes. If recipient doesn't confirm within 24 hours, system auto-completes and flags for review. |
| Address privacy | Full address is only shared with a recipient after they claim a listing. Only the borough is shown publicly. |
| Messaging | In-app messaging only. No external contact details shared. A safety banner appears on every chat thread. |

---

## 3. Technology Stack

### Frontend (Mobile)
- **Framework:** React Native (with Expo)
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **State management:** Zustand
- **Styling:** StyleSheet (React Native) â€” no Tailwind
- **Maps:** React Native Maps + Google Maps API (London-scoped)
- **Push notifications:** Expo Notifications + Firebase Cloud Messaging (FCM)
- **Image upload:** Expo ImagePicker
- **Storage:** AsyncStorage (local cache)

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT (JSON Web Tokens) â€” email/password only
- **File storage:** Firebase Storage (food listing photos)
- **Real-time:** Firebase Realtime Database (messaging and notifications)
- **Payments/donations:** Stripe (voluntary donations only â€” no mandatory payments)

### DevOps
- **Version control:** GitHub
- **Environment config:** .env files (never committed)
- **CI/CD:** GitHub Actions
- **Deployment:** Expo EAS Build (for iOS and Android distribution)

---

## 4. User Roles

### Donor
A user who donates surplus food. Can be an individual or a business.

**Donor capabilities:**
- Create, edit and remove food listings
- Set pick-up address, date, time window and expiry
- View who has claimed their listing
- Message recipients
- Mark a listing as collected (triggers recipient confirmation)
- Enable/disable voluntary donations per listing
- Set global anonymous donation preference in profile
- View donation history and total received
- Receive notifications: listing claimed, message received, pick-up completed, listing expiring, voluntary donation received

**Donor nav tabs:** Home (My Listings) Â· Messages Â· Post Food Â· Alerts Â· Profile

### Recipient
A user who collects surplus food.

**Recipient capabilities:**
- Browse food listings on a map or list view
- Filter by food category
- View listing detail including donor profile, pick-up window and food safety reminder
- Claim a listing
- Message donors
- Confirm collection after pick-up
- Make a voluntary donation after collection
- Rate the exchange (1â€“5 stars with optional comment)
- Receive notifications: new food nearby, claim confirmed, message received, pick-up reminder, listing expired

**Recipient nav tabs:** Home Â· Messages Â· My Claims Â· Alerts Â· Profile

---

## 5. Screen Inventory

Every screen that must be built, with its route name.

### Onboarding & Auth
| Screen | Route | Notes |
|---|---|---|
| Splash | `/splash` | Logo + tagline + Get started + Sign in |
| Role Selection | `/onboarding/role` | Donor or Recipient â€” single choice only |
| Sign Up | `/onboarding/signup` | Name, email, password, disclaimer checkbox |
| Sign In | `/auth/login` | Email, password, forgot password link |
| Forgot Password | `/auth/forgot-password` | 3-step: enter email â†’ check inbox â†’ reset |
| Reset Sent | `/auth/reset-sent` | Confirmation screen |

### Donor Screens
| Screen | Route | Notes |
|---|---|---|
| My Listings (Home) | `/donor/home` | Stats + tabbed Active/Completed/Expired |
| Create Listing Step 1 | `/donor/create/details` | Photo, title, category, quantity, description |
| Create Listing Step 2 | `/donor/create/pickup` | Address, date, time window, expiry, donation settings |
| Create Listing Step 3 | `/donor/create/review` | Summary + safety checkbox + publish |
| Listing Published | `/donor/create/success` | Confirmation screen |
| Mark Collected | `/donor/collected` | Pending confirmation state |

### Recipient Screens
| Screen | Route | Notes |
|---|---|---|
| Home Map | `/recipient/home` | Map view with listing pins |
| Home List | `/recipient/home` | List view toggle â€” same route, different view state |
| Listing Detail | `/recipient/listing/:id` | Full listing info + claim + message CTAs |
| Claim Confirmed | `/recipient/claimed` | Pick-up summary + message donor CTA |
| My Claims | `/recipient/claims` | Tabbed Active/Collected/Missed |
| Voluntary Donation | `/recipient/donate` | Â£1 / Â£5 / Â£10 / custom amount |
| Rate Exchange | `/recipient/rate` | 1â€“5 stars + optional comment |

### Shared Screens
| Screen | Route | Notes |
|---|---|---|
| Message Inbox | `/messages` | List of conversations tied to listings |
| Chat Thread | `/messages/:listingId` | Per-listing chat with safety banner |
| Notifications | `/notifications` | Grouped by Today / Yesterday |
| Profile | `/profile` | Stats + account + preferences + support |
| Community Guidelines | `/guidelines` | Static content with report button |

---

## 6. Data Models

### User
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'donor' | 'recipient';
  borough: string; // London borough
  locationCoords: { lat: number; lng: number };
  rating: number;
  ratingCount: number;
  donationsCount: number; // donor only
  collectionsCount: number; // recipient only
  foodSavedKg: number;
  totalDonationsReceived: number; // donor only â€” in pence
  anonymousDonations: boolean; // donor preference
  searchRadiusMiles: number; // recipient only
  foodPreferences: string[]; // recipient only
  createdAt: Date;
  updatedAt: Date;
}
```

### Listing
```typescript
interface Listing {
  _id: string;
  donorId: string;
  title: string;
  description: string;
  category: 'bakery' | 'fruit-veg' | 'dairy' | 'cooked' | 'other';
  quantity: string;
  servesCount: string;
  photoUrl: string;
  borough: string;
  fullAddress: string; // only revealed post-claim
  coords: { lat: number; lng: number };
  pickupDate: Date;
  pickupFrom: string; // e.g. "14:00"
  pickupUntil: string; // e.g. "18:00"
  expiryDate: Date;
  status: 'available' | 'claimed' | 'pending-confirmation' | 'completed' | 'expired';
  claimedBy: string | null; // recipientId
  claimedAt: Date | null;
  acceptsDonations: boolean;
  donorAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Exchange
```typescript
interface Exchange {
  _id: string;
  listingId: string;
  donorId: string;
  recipientId: string;
  claimedAt: Date;
  donorMarkedCollectedAt: Date | null;
  recipientConfirmedAt: Date | null;
  status: 'active' | 'pending-confirmation' | 'completed' | 'auto-completed';
  donationAmount: number | null; // in pence
  donationAnonymous: boolean;
  donorRating: number | null;
  donorRatingComment: string | null;
  recipientRating: number | null;
  recipientRatingComment: string | null;
  createdAt: Date;
}
```

### Message
```typescript
interface Message {
  _id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}
```

### Notification
```typescript
interface Notification {
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
  relatedId: string | null; // listingId, exchangeId etc
  createdAt: Date;
}
```

---

## 7. API Endpoints

### Auth
```
POST   /api/auth/register          â€” Create account
POST   /api/auth/login             â€” Sign in, returns JWT
POST   /api/auth/forgot-password   â€” Send reset email
POST   /api/auth/reset-password    â€” Set new password with token
GET    /api/auth/me                â€” Get current user (JWT required)
```

### Listings
```
GET    /api/listings               â€” Get nearby listings (lat, lng, radius params)
GET    /api/listings/:id           â€” Get single listing
POST   /api/listings               â€” Create listing (donor only)
PUT    /api/listings/:id           â€” Edit listing (donor only)
DELETE /api/listings/:id           â€” Remove listing (donor only)
POST   /api/listings/:id/claim     â€” Claim listing (recipient only)
POST   /api/listings/:id/collected â€” Donor marks collected
POST   /api/listings/:id/confirm   â€” Recipient confirms collection
```

### Exchanges
```
GET    /api/exchanges              â€” Get user's exchanges
GET    /api/exchanges/:id          â€” Get single exchange
POST   /api/exchanges/:id/donate   â€” Submit voluntary donation
POST   /api/exchanges/:id/rate     â€” Submit rating
```

### Messages
```
GET    /api/messages               â€” Get all conversations for user
GET    /api/messages/:listingId    â€” Get messages for a listing
POST   /api/messages/:listingId    â€” Send a message
```

### Notifications
```
GET    /api/notifications          â€” Get user notifications
PUT    /api/notifications/read-all â€” Mark all as read
```

### Users
```
GET    /api/users/:id              â€” Get public user profile
PUT    /api/users/me               â€” Update own profile
```

---

## 8. Design System

### Colour Palette
```
Primary yellow:    #f5c842  (main backgrounds, buttons, header bars)
Light cream:       #fffbeb  (screen backgrounds)
Pale lemon:        #fef9c3  (cards, notice boxes)
Amber border:      #fde68a  (card borders, dividers)
Golden amber:      #d4a017  (primary border, active states, icons)
Deep amber:        #92400e  (secondary text, icons)
Dark brown:        #78350f  (primary text, headings)
Dark red:          #991b1b  (destructive actions e.g. sign out)
Success green:     #dcfce7  (collected/available badges)
Success text:      #166534
Error red:         #fef2f2  (expired badges)
Error text:        #991b1b
```

### Typography
- **Font:** System font stack â€” `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Heading large:** 18â€“20px, weight 500
- **Body:** 12â€“13px, weight 400
- **Label/caption:** 10â€“11px, weight 400â€“500
- **Button:** 13â€“14px, weight 500

### Spacing
- Screen padding: 14â€“16px horizontal
- Card padding: 12px
- Gap between cards: 8â€“10px
- Section divider: 0.5px solid `#fde68a`

### Components
- **Primary button:** `#f5c842` background, `#78350f` text, 12px border radius, 13px padding vertical
- **Outline button:** Transparent background, `#d4a017` border 1.5px, `#92400e` text
- **Destructive button:** `#fef2f2` background, `#991b1b` text
- **Input field:** `#fff` background, `#fde68a` border, 10px border radius, 10px padding
- **Badge â€” available:** `#dcfce7` background, `#166534` text
- **Badge â€” claimed:** `#f5c842` background, `#78350f` text
- **Badge â€” expired:** `#fef2f2` background, `#991b1b` text
- **Tag/chip:** `#fef9c3` background, `#92400e` text, 20px border radius
- **Active tag:** `#f5c842` background, `#78350f` text, `#d4a017` border

---

## 9. Key UX Flows

### Donor: Post a listing
1. Tap "Post food" tab
2. Step 1 â€” Add photo, title, category, quantity, description â†’ Next
3. Step 2 â€” Enter address, pick-up window, expiry, voluntary donation toggle + name preference â†’ Next
4. Step 3 â€” Review summary, tick safety checkbox â†’ Publish
5. Success screen â†’ View my listings

### Donor: Mark collected (two-way confirmation)
1. Donor taps "Mark collected" on active listing card
2. Status â†’ `pending-confirmation`
3. Recipient receives push notification: "Please confirm you collected this food"
4. Recipient taps "Confirm collection" on their My Claims card
5. Both sides â†’ `completed`
6. Rating prompt triggers for both users
7. If recipient does not confirm within 24 hours â†’ auto-complete + flag for review

### Recipient: Claim a listing
1. Browse map or list â†’ tap listing pin or card
2. View listing detail â†’ tap "Claim this listing"
3. Claim confirmed screen â†’ option to message donor
4. Listing status â†’ `claimed`, full address revealed in message thread

### Recipient: Post-collection flow
1. Donor marks collected â†’ recipient confirms
2. Voluntary donation screen: choose Â£1 / Â£5 / Â£10 / custom amount â†’ or skip
3. Rate exchange: 1â€“5 stars + optional comment â†’ submit
4. Exchange status â†’ `completed`

---

## 10. Navigation Structure

```
Root Stack
â”œâ”€â”€ Splash
â”œâ”€â”€ Onboarding Stack
â”‚   â”œâ”€â”€ Role Selection
â”‚   â”œâ”€â”€ Sign Up
â”‚   â””â”€â”€ Sign In / Forgot Password
â””â”€â”€ Main Tab Navigator
    â”œâ”€â”€ [Donor] Home (My Listings)
    â”‚   â”œâ”€â”€ Create Listing (Step 1 â†’ 2 â†’ 3 â†’ Success)
    â”‚   â””â”€â”€ Mark Collected
    â”œâ”€â”€ [Recipient] Home (Map/List)
    â”‚   â”œâ”€â”€ Listing Detail
    â”‚   â”œâ”€â”€ Claim Confirmed
    â”‚   â”œâ”€â”€ Voluntary Donation
    â”‚   â””â”€â”€ Rate Exchange
    â”œâ”€â”€ Messages
    â”‚   â””â”€â”€ Chat Thread
    â”œâ”€â”€ [Donor] Post Food â†’ Create Listing Flow
    â”œâ”€â”€ [Donor] My Listings / [Recipient] My Claims
    â”œâ”€â”€ Alerts (Notifications)
    â””â”€â”€ Profile
        â””â”€â”€ Community Guidelines
```

---

## 11. Notification Types

| Type | Trigger | Recipient |
|---|---|---|
| `listing-claimed` | Recipient claims a listing | Donor |
| `claim-confirmed` | Donor marks collected | Recipient |
| `new-food-nearby` | New listing within user's radius | Recipient |
| `message-received` | New chat message | Either |
| `pickup-reminder` | 1 hour before pick-up window closes | Recipient |
| `pickup-completed` | Exchange confirmed complete | Donor |
| `listing-expiring` | 2 hours before listing expires unclaimed | Donor |
| `listing-expired` | Listing passed expiry unclaimed | Both |
| `donation-received` | Recipient submits voluntary donation | Donor |

---

## 12. Security & Safety Rules

- JWT tokens expire after 7 days. Refresh tokens are valid for 30 days.
- Passwords must be minimum 8 characters. Hashed with bcrypt (salt rounds: 12).
- Full pick-up address is **never** returned in listing API responses until a claim exists for the requesting recipient.
- All messages are stored server-side. No P2P messaging.
- Food safety disclaimer must be accepted at registration. The `disclaimerAccepted: true` flag is required before any listing or claim can be created.
- Voluntary donation amounts are stored in **pence** (integers) to avoid floating point issues.
- Rate limiting: 100 requests per minute per IP on all API routes.
- CORS: only allow requests from the Expo app bundle identifier.

---

## 13. Environment Variables

Create a `.env` file in both `/server` and `/app` directories. Never commit these.

### Server `.env`
```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG....
FROM_EMAIL=hello@FoodLodge.app
GOOGLE_MAPS_API_KEY=...
```

### App `.env`
```
EXPO_PUBLIC_API_URL=https://api.FoodLodge.app
EXPO_PUBLIC_GOOGLE_MAPS_KEY=...
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_DATABASE_URL=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 14. Folder Structure

```
FoodLodge/
â”œâ”€â”€ app/                          # React Native (Expo) frontend
â”‚   â”œâ”€â”€ assets/                   # Images, fonts, logo SVG
â”‚   â”œâ”€â”€ components/               # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ buttons/
â”‚   â”‚   â”œâ”€â”€ cards/
â”‚   â”‚   â”œâ”€â”€ inputs/
â”‚   â”‚   â”œâ”€â”€ badges/
â”‚   â”‚   â””â”€â”€ layout/
â”‚   â”œâ”€â”€ screens/                  # One file per screen
â”‚   â”‚   â”œâ”€â”€ onboarding/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ donor/
â”‚   â”‚   â”œâ”€â”€ recipient/
â”‚   â”‚   â”œâ”€â”€ shared/
â”‚   â”‚   â””â”€â”€ profile/
â”‚   â”œâ”€â”€ navigation/               # React Navigation config
â”‚   â”œâ”€â”€ store/                    # Zustand state stores
â”‚   â”œâ”€â”€ services/                 # API call functions
â”‚   â”œâ”€â”€ hooks/                    # Custom React hooks
â”‚   â”œâ”€â”€ utils/                    # Helpers and formatters
â”‚   â”œâ”€â”€ constants/                # Colours, spacing, text
â”‚   â”œâ”€â”€ types/                    # TypeScript interfaces
â”‚   â””â”€â”€ App.tsx
â”‚
â”œâ”€â”€ server/                       # Node.js + Express backend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ controllers/          # Route handler logic
â”‚   â”‚   â”œâ”€â”€ models/               # Mongoose schemas
â”‚   â”‚   â”œâ”€â”€ routes/               # Express route definitions
â”‚   â”‚   â”œâ”€â”€ middleware/           # Auth, rate limiting, error handling
â”‚   â”‚   â”œâ”€â”€ services/             # Business logic, notifications, Stripe
â”‚   â”‚   â”œâ”€â”€ utils/                # Helpers
â”‚   â”‚   â””â”€â”€ index.ts              # Entry point
â”‚   â”œâ”€â”€ .env
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ .github/
â”‚   â””â”€â”€ workflows/                # GitHub Actions CI/CD
â”œâ”€â”€ CLAUDE.md                     # This file
â””â”€â”€ README.md
```

---

## 15. Development Phases

Build in this order to maintain a working app at every stage.

### Phase 1 â€” Foundation
- [ ] Expo project setup with TypeScript
- [ ] Navigation structure (Stack + Tab)
- [ ] Design system: colours, typography, spacing constants
- [ ] Reusable component library: buttons, inputs, cards, badges
- [ ] Splash screen with FoodLodge logo

### Phase 2 â€” Auth
- [ ] Server: User model, register, login, JWT middleware
- [ ] App: Sign up screen, sign in screen, role selection
- [ ] App: Forgot password flow (email reset)
- [ ] App: Auth state persistence with AsyncStorage
- [ ] Food safety disclaimer checkbox at registration

### Phase 3 â€” Donor Core
- [ ] Server: Listing model + CRUD endpoints
- [ ] App: Create listing flow (3 steps)
- [ ] App: My listings screen (tabs: active, completed, expired)
- [ ] App: Photo upload via Expo ImagePicker â†’ Firebase Storage

### Phase 4 â€” Recipient Core
- [ ] Server: Geolocation query (listings within radius of coords)
- [ ] App: Home map screen with listing pins (Google Maps)
- [ ] App: Home list screen with category filters
- [ ] App: Listing detail screen + food safety reminder
- [ ] App: Claim listing flow + confirmed screen
- [ ] Address reveal logic (post-claim only)

### Phase 5 â€” Exchange & Confirmation
- [ ] Server: Exchange model + mark collected + recipient confirm endpoints
- [ ] App: Mark collected â†’ pending confirmation state
- [ ] App: Recipient confirm collection
- [ ] Auto-complete job (24hr timeout â€” use a cron job)

### Phase 6 â€” Messaging
- [ ] Firebase Realtime Database for message threads
- [ ] App: Message inbox screen
- [ ] App: Chat thread screen with safety banner
- [ ] New message push notifications

### Phase 7 â€” Notifications
- [ ] Firebase Cloud Messaging setup
- [ ] Server: Notification triggers for all event types
- [ ] App: Notifications centre screen (grouped by day)
- [ ] App: Push notification permission request on first launch

### Phase 8 â€” Donations & Ratings
- [ ] Stripe integration (voluntary donations only)
- [ ] App: Voluntary donation screen (Â£1 / Â£5 / Â£10 / custom)
- [ ] Server: Process donation, record amount, notify donor
- [ ] App: Rate exchange screen (stars + comment)
- [ ] Server: Update user rating averages after each exchange

### Phase 9 â€” Profile & Settings
- [ ] App: Profile screen (donor + recipient variants)
- [ ] App: Edit personal details
- [ ] App: Notification preferences
- [ ] App: Search/location radius setting
- [ ] App: Anonymous donation toggle (donor)
- [ ] App: Food preferences (recipient)
- [ ] App: Community guidelines screen

### Phase 10 â€” Polish & Launch
- [ ] Error handling throughout (network errors, validation)
- [ ] Loading states and skeleton screens
- [ ] Empty states for all list screens
- [ ] Offline detection and graceful degradation
- [ ] Expo EAS Build configuration for iOS and Android
- [ ] App Store and Google Play submission assets
- [ ] Privacy policy and terms of service pages

---

## 16. Community Guidelines Content

The following content must appear verbatim on the Community Guidelines screen.

**Food safety**
Only donate food you'd give to a friend. Label allergens clearly. Never donate food that is spoiled, past its use-by date, or improperly stored. Home-cooked food should be clearly described and stored safely before collection.

**For donors**
List food accurately. Be available during your pick-up window. Cancel listings you can no longer fulfil. Treat all recipients with respect regardless of background or circumstance.

**For recipients**
Only claim food you genuinely intend to collect. Arrive within the pick-up window. Confirm collection promptly. Treat donors with kindness â€” they are sharing out of goodwill.

**Conduct & trust**
Keep all communication on FoodLodge. Never share personal contact details. FoodLodge is not for commercial gain. Repeated no-shows or abusive behaviour may result in account suspension.

---

## 17. Food Safety Disclaimer

This text must appear at sign-up (with mandatory checkbox) and as a notice on every listing detail screen.

> **Food safety disclaimer:** FoodLodge connects donors and recipients but does not verify food safety or quality. All food exchanges are made in good faith. FoodLodge accepts no liability for illness, injury or harm resulting from food exchanged on this platform. Recipients should use their own judgement before consuming any items collected through FoodLodge.

---

## 18. Brand Assets

### Logo
The FoodLodge logo is a location pin shape in golden yellow (`#f5c842`) with an amber border (`#d4a017`). Inside the pin's inner white circle is a colourful arrangement of vegetables and groceries (broccoli, carrot, tomato, lemon, apple, green pepper, corn, aubergine, bread loaf). The logo SVG is stored at `/app/assets/logo.svg`.

### Wordmark
- "Food" â€” weight 600, colour `#78350f` (dark brown)
- "Share" â€” weight 300, colour `#d4a017` (golden amber)
- Font: system font stack

### Tagline
> Connecting surplus food with people who need it

---

## 19. Testing Requirements

- Unit tests for all API controllers (Jest)
- Integration tests for auth, listing creation, claim and exchange flows
- E2E tests for the two critical flows: post a listing â†’ claim â†’ confirm â†’ rate
- Test on both iOS simulator and Android emulator before any release
- Test push notifications on physical devices (simulators do not support FCM)

---

## 20. Important Notes for Developers

1. **Always use borough-level location for public listing display.** Never expose full address until a claim exists.
2. **The food safety disclaimer is legally important.** It must be shown and accepted at registration and surfaced on listing detail screens. Do not remove or abbreviate it.
3. **Donation amounts are stored in pence.** Always divide by 100 for display. Never store as floats.
4. **Role is immutable from the UI.** The `role` field on a User document cannot be updated through the app. Only a support admin can change it directly in the database.
5. **The map is scoped to London.** Set the default map region to Greater London and do not allow listings outside the M25 boundary. Validate borough on listing creation server-side.
6. **Two-way collection confirmation is core logic.** Do not simplify this to a single-side confirmation. Both the donor and recipient must confirm for an exchange to complete cleanly.
7. **Anonymous donations still show the amount.** When `donorAnonymous` is true, display "An anonymous donor gave Â£X.XX" â€” never hide the amount.
8. **Messages are per-listing, not per-user.** A conversation thread is tied to a specific `listingId`, not a direct user-to-user channel.
9. **Listings auto-expire.** Run a scheduled job (every 30 minutes) to check for listings where `expiryDate` has passed and `status === 'available'` â†’ set to `expired` and notify donor.
10. **Auto-complete exchanges.** Run a scheduled job (every hour) to check for exchanges where `status === 'pending-confirmation'` and `donorMarkedCollectedAt` is more than 24 hours ago â†’ set to `auto-completed` and flag.
