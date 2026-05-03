import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  getListings, getNearbyListings, getListing,
  createListing, updateListing, deleteListing,
  claimListing, markCollected, confirmCollection,
} from '../controllers/listing.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getListings);
router.get('/nearby', getNearbyListings);
router.get('/:id', getListing);
router.post('/', requireRole('donor'), createListing);
router.put('/:id', requireRole('donor'), updateListing);
router.delete('/:id', requireRole('donor'), deleteListing);
router.post('/:id/claim', requireRole('recipient'), claimListing);
router.post('/:id/collected', requireRole('donor'), markCollected);
router.post('/:id/confirm', requireRole('recipient'), confirmCollection);

export default router;
