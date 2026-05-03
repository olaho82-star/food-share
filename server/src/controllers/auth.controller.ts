import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth.middleware';

function signAccessToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role, disclaimerAccepted } = req.body;

  if (!name || !email || !password || !role || !disclaimerAccepted) {
    res.status(400).json({ message: 'All fields are required and disclaimer must be accepted' });
    return;
  }
  if (!['donor', 'recipient'].includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role, disclaimerAccepted });

  const accessToken = signAccessToken(String(user._id), user.role);
  const refreshToken = signRefreshToken(String(user._id));

  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      borough: user.borough,
      rating: user.rating,
      disclaimerAccepted: user.disclaimerAccepted,
    },
    accessToken,
    refreshToken,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const accessToken = signAccessToken(String(user._id), user.role);
  const refreshToken = signRefreshToken(String(user._id));

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      borough: user.borough,
      rating: user.rating,
      disclaimerAccepted: user.disclaimerAccepted,
    },
    accessToken,
    refreshToken,
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always respond the same way to avoid email enumeration
  if (!user) {
    res.json({ message: 'If that email exists, a reset link has been sent' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(user.email, token);

  res.json({ message: 'If that email exists, a reset link has been sent' });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ message: 'Token and new password are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({ message: 'Reset link is invalid or has expired' });
    return;
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).select('-passwordHash -passwordResetToken -passwordResetExpires');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ user });
}
