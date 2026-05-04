import { Response } from 'express';
import { Message } from '../models/message.model';
import { Listing } from '../models/listing.model';
import { getDb } from '../services/firebase';
import { AuthRequest } from '../middleware/auth.middleware';

async function assertParticipant(listingId: string, userId: string) {
  const listing = await Listing.findById(listingId);
  if (!listing) return null;
  const isDonor = String(listing.donorId) === userId;
  const isClaimant = listing.claimedBy && String(listing.claimedBy) === userId;
  if (!isDonor && !isClaimant) return null;
  return listing;
}

export async function getConversations(req: AuthRequest, res: Response) {
  const messages = await Message.find({
    $or: [{ senderId: req.userId }, { receiverId: req.userId }],
  })
    .sort({ createdAt: -1 })
    .populate('listingId', 'title borough status photoUrl');

  const seen = new Set<string>();
  const conversations: object[] = [];
  for (const msg of messages) {
    const lid = String(msg.listingId);
    if (!seen.has(lid)) {
      seen.add(lid);
      const unread = await Message.countDocuments({
        listingId: msg.listingId,
        receiverId: req.userId,
        read: false,
      });
      conversations.push({ listing: msg.listingId, lastMessage: msg, unreadCount: unread });
    }
  }
  res.json({ conversations });
}

export async function getMessages(req: AuthRequest, res: Response) {
  const { listingId } = req.params;
  const listing = await assertParticipant(listingId, req.userId!);
  if (!listing) { res.status(403).json({ message: 'Forbidden' }); return; }

  await Message.updateMany({ listingId, receiverId: req.userId }, { read: true });

  const messages = await Message.find({ listingId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name');
  res.json({ messages });
}

export async function sendMessage(req: AuthRequest, res: Response) {
  const { listingId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) { res.status(400).json({ message: 'Message content is required' }); return; }
  if (content.length > 2000) { res.status(400).json({ message: 'Message too long' }); return; }

  const listing = await assertParticipant(listingId, req.userId!);
  if (!listing) { res.status(403).json({ message: 'You are not a participant in this listing' }); return; }

  const receiverId = String(listing.donorId) === req.userId
    ? String(listing.claimedBy)
    : String(listing.donorId);

  const message = await Message.create({
    listingId,
    senderId: req.userId,
    receiverId,
    content: content.trim(),
  });

  try {
    const rtdb = getDb();
    await rtdb.ref(`messages/${listingId}`).push({
      _id: String(message._id),
      senderId: req.userId,
      receiverId,
      content: content.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Firebase write failed:', err);
  }

  res.status(201).json({ message });
}
