import cron from 'node-cron';
import { Exchange } from '../models/exchange.model';
import { Listing } from '../models/listing.model';

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

  // Expire listings past their expiry date every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    const result = await Listing.updateMany(
      { status: 'available', expiryDate: { $lt: new Date() } },
      { status: 'expired' }
    );
    if (result.modifiedCount > 0) {
      console.log(`Expired ${result.modifiedCount} listing(s)`);
    }
  });
}
