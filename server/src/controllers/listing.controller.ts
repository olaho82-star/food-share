import { Response } from 'express';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { Exchange } from '../models/exchange.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../services/push.service';

const BOROUGH_COORDS: Record<string, { lat: number; lng: number }> = {
  'Barking and Dagenham': { lat: 51.5607, lng: 0.1557 },
  'Barnet':               { lat: 51.6252, lng: -0.1517 },
  'Bexley':               { lat: 51.4549, lng: 0.1505 },
  'Brent':                { lat: 51.5588, lng: -0.2817 },
  'Bromley':              { lat: 51.4039, lng: 0.0198 },
  'Camden':               { lat: 51.5290, lng: -0.1255 },
  'City of London':       { lat: 51.5155, lng: -0.0922 },
  'Croydon':              { lat: 51.3714, lng: -0.0985 },
  'Ealing':               { lat: 51.5130, lng: -0.3089 },
  'Enfield':              { lat: 51.6538, lng: -0.0799 },
  'Greenwich':            { lat: 51.4934, lng: 0.0098 },
  'Hackney':              { lat: 51.5450, lng: -0.0553 },
  'Hammersmith and Fulham': { lat: 51.4927, lng: -0.2339 },
  'Haringey':             { lat: 51.5906, lng: -0.1119 },
  'Harrow':               { lat: 51.5898, lng: -0.3346 },
  'Havering':             { lat: 51.5812, lng: 0.2128 },
  'Hillingdon':           { lat: 51.5441, lng: -0.4760 },
  'Hounslow':             { lat: 51.4746, lng: -0.3680 },
  'Islington':            { lat: 51.5416, lng: -0.1025 },
  'Kensington and Chelsea': { lat: 51.4991, lng: -0.1938 },
  'Kingston upon Thames': { lat: 51.4085, lng: -0.3064 },
  'Lambeth':              { lat: 51.4571, lng: -0.1231 },
  'Lewisham':             { lat: 51.4452, lng: -0.0209 },
  'Merton':               { lat: 51.4014, lng: -0.1958 },
  'Newham':               { lat: 51.5077, lng: 0.0469 },
  'Redbridge':            { lat: 51.5590, lng: 0.0741 },
  'Richmond upon Thames': { lat: 51.4479, lng: -0.3260 },
  'Southwark':            { lat: 51.5035, lng: -0.0804 },
  'Sutton':               { lat: 51.3618, lng: -0.1945 },
  'Tower Hamlets':        { lat: 51.5203, lng: -0.0293 },
  'Waltham Forest':       { lat: 51.5908, lng: -0.0134 },
  'Wandsworth':           { lat: 51.4571, lng: -0.1918 },
  'Westminster':          { lat: 51.4975, lng: -0.1357 },
};

const LONDON_BOROUGHS = Object.keys(BOROUGH_COORDS);

export async function getListings(req: AuthRequest, res: Response) {
  const { status } = req.query;

  if (req.userRole === 'recipient') {
    const query: Record<string, unknown> = { claimedBy: req.userId };
    if (status) {
      const statuses = (status as string).split(',');
      query.status = { $in: statuses };
    }
    const listings = await Listing.find(query).sort({ claimedAt: -1 });
    res.json({ listings });
    return;
  }

  const query: Record<string, unknown> = { donorId: req.userId };
  if (status) {
    const statuses = (status as string).split(',');
    query.status = { $in: statuses };
  }
  const listings = await Listing.find(query).sort({ createdAt: -1 });
  res.json({ listings });
}

export async function getNearbyListings(_req: AuthRequest, res: Response) {
  const listings = await Listing.find({ status: 'available' })
    .select('-fullAddress')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ listings });
}

export async function getListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id).populate('donorId', 'name rating ratingCount');
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }

  const listingObj = listing.toObject() as unknown as Record<string, unknown>;
  const isClaimant = listing.claimedBy && String(listing.claimedBy) === req.userId;
  if (!isClaimant) {
    delete listingObj.fullAddress;
  }
  res.json({ listing: listingObj });
}

export async function createListing(req: AuthRequest, res: Response) {
  if (req.userRole !== 'donor') { res.status(403).json({ message: 'Only donors can create listings' }); return; }

  const { title, description, category, quantity, servesCount, photoUrl, borough, fullAddress, pickupDate, pickupFrom, pickupUntil, expiryDate, acceptsDonations, donorAnonymous } = req.body;

  if (!LONDON_BOROUGHS.includes(borough)) {
    res.status(400).json({ message: 'Borough must be a valid London borough' });
    return;
  }

  const listing = await Listing.create({
    donorId: req.userId,
    title, description, category, quantity, servesCount,
    photoUrl: photoUrl || '',
    borough, fullAddress,
    coords: BOROUGH_COORDS[borough] || { lat: 51.5074, lng: -0.1278 },
    pickupDate, pickupFrom, pickupUntil, expiryDate,
    acceptsDonations: !!acceptsDonations,
    donorAnonymous: !!donorAnonymous,
  });

  await User.findByIdAndUpdate(req.userId, { $inc: { donationsCount: 1 } });

  res.status(201).json({ listing });
}

export async function updateListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findOne({ _id: req.params.id, donorId: req.userId });
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (listing.status !== 'available') { res.status(400).json({ message: 'Only available listings can be edited' }); return; }

  const allowed = ['title', 'description', 'quantity', 'servesCount', 'pickupDate', 'pickupFrom', 'pickupUntil', 'expiryDate', 'acceptsDonations', 'donorAnonymous'];
  allowed.forEach((field) => { if (req.body[field] !== undefined) (listing as any)[field] = req.body[field]; });
  await listing.save();
  res.json({ listing });
}

export async function deleteListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findOne({ _id: req.params.id, donorId: req.userId });
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (['claimed', 'pending-confirmation'].includes(listing.status)) {
    res.status(400).json({ message: 'Cannot delete a listing that has been claimed' });
    return;
  }
  await listing.deleteOne();
  res.json({ message: 'Listing removed' });
}

export async function claimListing(req: AuthRequest, res: Response) {
  if (req.userRole !== 'recipient') { res.status(403).json({ message: 'Only recipients can claim listings' }); return; }

  const listing = await Listing.findById(req.params.id);
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (listing.status !== 'available') { res.status(400).json({ message: 'This listing is no longer available' }); return; }

  const claimedAt = new Date();
  listing.status = 'claimed';
  listing.claimedBy = req.userId as unknown as typeof listing.claimedBy;
  listing.claimedAt = claimedAt;
  await listing.save();

  await Exchange.create({
    listingId: listing._id,
    donorId: listing.donorId,
    recipientId: req.userId,
    claimedAt,
  });

  sendNotification({
    userId: String(listing.donorId),
    type: 'listing-claimed',
    title: 'Your listing was claimed 🎉',
    body: `Someone has claimed "${listing.title}". Check your messages.`,
    relatedId: String(listing._id),
  });

  res.json({ listing });
}

export async function markCollected(req: AuthRequest, res: Response) {
  const listing = await Listing.findOne({ _id: req.params.id, donorId: req.userId });
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (listing.status !== 'claimed') { res.status(400).json({ message: 'Listing must be claimed before marking collected' }); return; }

  listing.status = 'pending-confirmation';
  await listing.save();

  await Exchange.findOneAndUpdate(
    { listingId: listing._id },
    { status: 'pending-confirmation', donorMarkedCollectedAt: new Date() }
  );

  if (listing.claimedBy) {
    sendNotification({
      userId: String(listing.claimedBy),
      type: 'claim-confirmed',
      title: 'Please confirm your collection',
      body: `The donor has marked "${listing.title}" as collected. Please confirm you received it.`,
      relatedId: String(listing._id),
    });
  }

  res.json({ listing });
}

export async function confirmCollection(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (String(listing.claimedBy) !== req.userId) { res.status(403).json({ message: 'Forbidden' }); return; }
  if (listing.status !== 'pending-confirmation') { res.status(400).json({ message: 'Listing is not awaiting confirmation' }); return; }

  const now = new Date();
  listing.status = 'completed';
  await listing.save();

  await Exchange.findOneAndUpdate(
    { listingId: listing._id },
    { status: 'completed', recipientConfirmedAt: now }
  );

  await User.findByIdAndUpdate(req.userId, { $inc: { collectionsCount: 1 } });

  sendNotification({
    userId: String(listing.donorId),
    type: 'pickup-completed',
    title: 'Collection confirmed ✅',
    body: `The recipient confirmed they collected "${listing.title}". Exchange complete!`,
    relatedId: String(listing._id),
  });

  res.json({ listing });
}
