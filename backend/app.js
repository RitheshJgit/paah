import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// ✅ CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Logger
app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Health
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ❌ 404
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// ❌ Error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ msg: 'Server error' });
});

export default app; // 🔥 THIS WAS MISSING
