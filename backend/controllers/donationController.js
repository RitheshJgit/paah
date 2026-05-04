import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { sendDonationApprovedEmail } from '../services/emailService.js';


// CREATE DONATION
export const createDonation = async (req, res) => {
  try {
    const {
      type,
      amount,
      weight,
      quantity,
      itemName,
      witnessName,
      witnessPhone
    } = req.body;

    let points = 0;

    if (type === "money") points = Number(amount);
    if (type === "clothes") points = Number(weight) * 100;
    if (type === "books") points = Number(quantity) * 50;

    // ✅ FIXED (CLOUDINARY URL)
    const proofImage = req.file ? req.file.path : null;

    const donation = await Donation.create({
      userId: req.user._id,
      type,
      amount,
      weight,
      quantity,
      itemName,
      witnessName,
      witnessPhone,
      proofImage,
      finalPoints: type === "other" ? null : points,
      status: "pending"
    });

    res.json(donation);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET USER DONATIONS
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN VERIFY DONATION
export const verifyDonation = async (req, res) => {
  try {
    const { donationId, status } = req.body;

    // ✅ VALIDATE STATUS
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    // ❌ prevent double verification
    if (donation.status !== 'pending') {
      return res.status(400).json({ msg: 'Already verified' });
    }

    const user = await User.findById(donation.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 🔥 CALCULATE POINTS (SERVER-SIDE ONLY)
    let calculatedPoints = 0;

    if (donation.type === "money") {
      calculatedPoints = Number(donation.amount);
    } else if (donation.type === "clothes") {
      calculatedPoints = Number(donation.weight) * 100;
    } else if (donation.type === "books") {
      calculatedPoints = Number(donation.quantity) * 50;
    }

    // 🔄 UPDATE DONATION
    donation.status = status;
    donation.finalPoints = calculatedPoints;
    donation.verifiedBy = req.user._id;

    await donation.save();

    // ✅ UPDATE USER (ONLY IF APPROVED)
    let updatedUser = user;

    if (status === 'approved' && calculatedPoints > 0) {
      updatedUser = await User.findByIdAndUpdate(
        donation.userId,
        { $inc: { credits: calculatedPoints } },
        { new: true }
      );

      // 🔥 EMAIL (NON-BLOCKING)
      sendDonationApprovedEmail(updatedUser)
        .catch(err => console.log("Email failed:", err.message));
    }

    // ✅ TEAM UPDATE
    if (user.teamId) {
      const team = await Team.findById(user.teamId);

      if (team) {
        team.totalDonations = Number(team.totalDonations || 0);
        team.acceptedDonations = Number(team.acceptedDonations || 0);
        team.totalPoints = Number(team.totalPoints || 0);

        // TOTAL always increases
        team.totalDonations += 1;

        if (status === 'approved' && calculatedPoints > 0) {
          team.totalPoints += calculatedPoints;
          team.acceptedDonations += 1;
        }

        // TRUST SCORE
        team.trustScore =
          team.totalDonations > 0
            ? Number(
                (
                  (team.acceptedDonations / team.totalDonations) * 100
                ).toFixed(2)
              )
            : 0;

        await team.save();
      }
    }

    res.json({
      msg: 'Donation verified',
      donation,
      userCredits: updatedUser.credits
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const getPendingDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'pending' })
      .populate('userId', 'name email');

    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const total = await Donation.countDocuments();
    const approved = await Donation.countDocuments({ status: 'approved' });
    const rejected = await Donation.countDocuments({ status: 'rejected' });
    const pending = await Donation.countDocuments({ status: 'pending' });

    const totalCreditsAgg = await Donation.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: "$finalPoints" } } }
    ]);

    const totalCredits = totalCreditsAgg[0]?.total || 0;

    // 🔥 TOP USER
    const topUser = await User.findOne().sort({ credits: -1 }).select('name credits');

    // 🔥 TOP TEAM
    const topTeam = await Team.findOne().sort({ totalPoints: -1 }).select('name totalPoints');

    res.json({
      total,
      approved,
      rejected,
      pending,
      totalCredits,
      topUser,
      topTeam
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};