import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({

  // 🔹 BASIC INFO
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  // 🔹 TASK TYPE
  type: {
    type: String,
    enum: ['common', 'special', 'collab'],
    required: true
  },

  // 🔹 CREDIT SYSTEM
  creditPoints: {
    type: Number,
    required: true,
    min: 1
  },

  // 🔹 TEAM LIMIT (special / collab only)
  maxTeams: {
    type: Number,
    default: null
  },

  // 🔹 TRACK JOINED TEAMS
  teamsJoined: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  ],

  // 🔥 OPTIONAL ANALYTICS (GOOD FOR DASHBOARD)
  totalSubmissions: {
    type: Number,
    default: 0
  },

  totalApproved: {
    type: Number,
    default: 0
  },

  totalRejected: {
    type: Number,
    default: 0
  },

  // 🔹 STATUS
  status: {
    type: String,
    enum: ['active', 'completed', 'disabled'],
    default: 'active'
  },

  // 🔹 ADMIN INFO
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deadline: {
  type: Date,
  required: true
},
isFrozen: {
  type: Boolean,
  default: false
}

}, { timestamps: true });

export default mongoose.model('Task', taskSchema);