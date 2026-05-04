import TaskSubmission from '../models/TaskSubmission.js';
import Donation from '../models/Donation.js';
import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    // 🔥 GET USER + TEAM
    const user = await User.findById(req.user._id)
      .populate("teamId", "name trustScore");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 TRUST SCORE CALCULATION
    const total = await Donation.countDocuments({
      userId: user._id,
    });

    const approved = await Donation.countDocuments({
      userId: user._id,
      status: "approved",
    });

    const trustScore =
      total === 0 ? 0 : Math.round((approved / total) * 100);

    // 🔥 STATS
    const tasksCompleted = await TaskSubmission.countDocuments({
      userId: user._id,
      status: "approved",
    });

    const pendingTasks = await TaskSubmission.countDocuments({
      userId: user._id,
      status: "pending",
    });

    const donations = total;

    // 🔥 RECENT TASKS
    const recentTasks = await TaskSubmission.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // 🔥 RECENT DONATIONS
    const recentDonations = await Donation.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    // 🔥 MERGE + FORMAT ACTIVITY
    const recentActivity = [
      ...recentTasks.map((t) => ({
        type: "task",
        title: `Completed task: ${t.title || "Task"}`,
        date: t.createdAt,
        credits: t.points || 0,
      })),

      ...recentDonations.map((d) => ({
        type: "donation",
        title: "Donated items",
        date: d.createdAt,
        credits: d.finalPoints || 0,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // 🔥 FINAL RESPONSE
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,

      trustScore,

      team: user.teamId?.name || null,
      createdAt: user.createdAt,

      stats: {
        tasksCompleted,
        pendingTasks,
        donations,
      },

      recentActivity, // 🔥 NEW FIELD
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      teamId: req.user.teamId,
      credits: req.user.credits
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};