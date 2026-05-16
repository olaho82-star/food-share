import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import exchangeRoutes from './routes/exchange.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import premiumRoutes from './routes/premium.routes';
import supportRoutes from './routes/support.routes';
import { startScheduler } from './services/scheduler';
import { initFirebase } from './services/firebase';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/support', supportRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler — ensures all errors return JSON, never HTML
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server error]', err?.message || err);
  res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    initFirebase();
    startScheduler();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
