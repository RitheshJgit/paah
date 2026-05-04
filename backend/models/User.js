import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
},
  password: String,

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },

  credits: { type: Number, default: 0 },
  trustScore: { type: Number, default: 50 },
  resetOTP: String,
resetOTPExpire: Date,

}, { timestamps: true });

export default mongoose.model('User', userSchema);