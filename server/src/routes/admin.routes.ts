import { Router, Request, Response, NextFunction } from 'express';
import { getStats } from '../controllers/admin.controller';

const router = Router();

function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.query.key !== secret) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }
  next();
}

router.get('/stats', requireAdminKey, getStats);

export default router;