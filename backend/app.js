import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

// ✅ JSON parsing
app.use(express.json());

// ✅ 🔥 SERVE UPLOADS (VERY IMPORTANT)
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

// ✅ Debug logger
app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// ❌ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ msg: 'Server error' });
});

export default app;