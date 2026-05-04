import 'dotenv/config';
import express from 'express';
import path from 'path';
import app from './app.js';
import connectDB from './config/db.js';
import './cron/taskCron.js';

console.log("MONGO_URI:", process.env.MONGO_URI);

const startServer = async () => {
  try {
    await connectDB(); // ✅ ensure DB connected first

    const PORT = process.env.PORT || 8000;

    // ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server start failed:", err.message);
    process.exit(1);
  }
};

startServer();