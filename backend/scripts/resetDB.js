import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("🔄 Clearing database...");

await User.deleteMany();
await Team.deleteMany();
await Task.deleteMany();
await TaskSubmission.deleteMany();

console.log("✅ Database reset complete");

process.exit();