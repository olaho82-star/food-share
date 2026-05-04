import cron from 'node-cron';
import { Exchange } from '../models/exchange.model';
import { Listing } from '../models/listing.model';
import { sendNotification } from './push.service';

export function startScheduler() {
  // Auto-complete exchanges pending confirmation for more than 24 hours
  cron.schedule('0 * * * *', async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await Exchange.find({
      status: 'pending-confirmation',
      donorMarkedCollectedAt: { $lt: cutoff },
    });

    for (const exchange of stale) {
      exchange.status = 'auto-completed';
      await exchange.save();
      await Listing.findByIdAndUpdate(exchange.listingId, { status: 'completed' });
      console.log(`Auto-completed exchange ${exchange._id}`);
    }
  });

  // Expire listings and send notifications every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Warn donors 2 hours before expiry
    const expiring = await Listing.find({
      status: 'available',
      expiryDate: { $gt: now, $lt: twoHoursFromNow },
    });
    for (const listing of expiring) {
      sendNotification({
        userId: String(listing.donorId),
        type: 'listing-expiring',
        title: 'Listing expiring soon ⏰',
        body: `"${listing.title}" expires in under 2 hours and hasn't been claimed yet.`,
        relatedId: String(listing._id),
      });
    }

    // Expire overdue listings
    const expired = await Listing.find({ status: 'available', expiryDate: { $lt: now } });
    for (const listing of expired) {
      listing.status = 'expired';
      await listing.save();
      sendNotification({
        userId: String(listing.donorId),
        type: 'listing-expired',
        title: 'Listing expired',
        body: `"${listing.title}" has expired without being claimed.`,
        relatedId: String(listing._id),
      });
      console.log(`Expired listing ${listing._id}`);
    }
  });
}
