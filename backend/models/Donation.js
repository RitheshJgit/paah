import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  type: {
    type: String,
   enum: ['money', 'clothes', 'books', 'other'],
    required: true
  },

  amount: Number, // money ₹
  weight: Number, // clothes kg
  quantity: Number, // for books

  itemName: String, // for "other"

  witnessName: String,
  witnessPhone: String,

  proofImage: String,

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  finalPoints: Number,

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

export default mongoose.model('Donation', donationSchema);