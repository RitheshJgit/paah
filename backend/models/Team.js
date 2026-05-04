import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

 members: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}],

  totalPoints: {
    type: Number,
    default: 0
  },

  totalDonations: {
  type: Number,
  default: 0
},

acceptedDonations: {
  type: Number,
  default: 0
},

trustScore: {
  type: Number,
  default: 0
}

}, { timestamps: true });

export default mongoose.model('Team', teamSchema);