import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { Exchange } from '../models/exchange.model';

export async function getStats(_req: Request, res: Response) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [
    totalUsers,
    donors,
    recipients,
    newToday,
    newThisWeek,
    recentUsers,
    totalListings,
    activeListings,
    claimedListings,
    completedListings,
    expiredListings,
    totalExchanges,
    activeExchanges,
    completedExchanges,
    autoCompletedExchanges,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'recipient' }),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role borough createdAt'),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'available' }),
    Listing.countDocuments({ status: 'claimed' }),
    Listing.countDocuments({ status: 'completed' }),
    Listing.countDocuments({ status: 'expired' }),
    Exchange.countDocuments(),
    Exchange.countDocuments({ status: 'active' }),
    Exchange.countDocuments({ status: 'completed' }),
    Exchange.countDocuments({ status: 'auto-completed' }),
  ]);

  res.json({
    generatedAt: now.toISOString(),
    users: {
      total: totalUsers,
      donors,
      recipients,
      newToday,
      newThisWeek,
      recent: recentUsers,
    },
    listings: {
      total: totalListings,
      active: activeListings,
      claimed: claimedListings,
      completed: completedListings,
      expired: expiredListings,
    },
    exchanges: {
      total: totalExchanges,
      active: activeExchanges,
      completed: completedExchanges,
      autoCompleted: autoCompletedExchanges,
    },
  });
}