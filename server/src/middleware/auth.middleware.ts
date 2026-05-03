import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'donor' | 'recipient';
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    const user = await User.findById(payload.userId).select('_id role');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.userId = String(user._id);
    req.userRole = user.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role: 'donor' | 'recipient') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}
