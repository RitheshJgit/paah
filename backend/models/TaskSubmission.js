import mongoose from "mongoose";

const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },

  // 🔥 STEP 1: ACCEPTED (implicit)

  // 🔥 STEP 2: COMPLETED
  completed: {
    type: Boolean,
    default: false
  },

  completedAt: Date,

  // 🔥 STEP 3: PROOF
  proofImage: String,
  witnessName: String,
  witnessPhone: String,

  // 🔥 STEP 4: ADMIN VERIFY
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  aiScore: {
  type: Number,
  default: 0
},
aiFlags: [String],
aiValid: {
  type: Boolean,
  default: true
},

}, { timestamps: true });

export default mongoose.model('TaskSubmission', taskSubmissionSchema);