import { Response } from 'express';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

const LONDON_BOROUGHS = [
  'Barking and Dagenham','Barnet','Bexley','Brent','Bromley','Camden',
  'City of London','Croydon','Ealing','Enfield','Greenwich','Hackney',
  'Hammersmith and Fulham','Haringey','Harrow','Havering','Hillingdon',
  'Hounslow','Islington','Kensington and Chelsea','Kingston upon Thames',
  'Lambeth','Lewisham','Merton','Newham','Redbridge','Richmond upon Thames',
  'Southwark','Sutton','Tower Hamlets','Waltham Forest','Wandsworth','Westminster',
];

export async function getListings(req: AuthRequest, res: Response) {
  const { status } = req.query;

  if (req.userRole === 'recipient') {
    const query: Record<string, unknown> = { claimedBy: req.userId };
    if (status) query.status = status;
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

export async function getNearbyListings(req: AuthRequest, res: Response) {
  const listings = await Listing.find({ status: 'available' })
    .select('-fullAddress')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ listings });
}

export async function getListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id).populate('donorId', 'name rating ratingCount');
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }

  const listingObj = listing.toObject() as Record<string, unknown>;
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
    coords: { lat: 0, lng: 0 },
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

  listing.status = 'claimed';
  listing.claimedBy = req.userId as unknown as typeof listing.claimedBy;
  listing.claimedAt = new Date();
  await listing.save();

  res.json({ listing });
}

export async function markCollected(req: AuthRequest, res: Response) {
  const listing = await Listing.findOne({ _id: req.params.id, donorId: req.userId });
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (listing.status !== 'claimed') { res.status(400).json({ message: 'Listing must be claimed before marking collected' }); return; }

  listing.status = 'pending-confirmation';
  await listing.save();
  res.json({ listing });
}

export async function confirmCollection(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) { res.status(404).json({ message: 'Listing not found' }); return; }
  if (String(listing.claimedBy) !== req.userId) { res.status(403).json({ message: 'Forbidden' }); return; }
  if (listing.status !== 'pending-confirmation') { res.status(400).json({ message: 'Listing is not awaiting confirmation' }); return; }

  listing.status = 'completed';
  await listing.save();

  await User.findByIdAndUpdate(req.userId, { $inc: { collectionsCount: 1 } });
  res.json({ listing });
}
