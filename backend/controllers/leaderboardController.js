import User from '../models/User.js';
import Team from '../models/Team.js';
import Donation from '../models/Donation.js';

// 🧍 INDIVIDUAL (ALL TIME)
export const getIndividualLeaderboard = async (req, res) => {
  const users = await User.find()
    .sort({ credits: -1 })
    .select('name credits');

  res.json(users);
};

// 👥 TEAM (ALL TIME)
export const getTeamLeaderboard = async (req, res) => {
  const teams = await Team.find()
    .sort({ totalPoints: -1 })
    .select('name totalPoints trustScore');

  res.json(teams);
};

// 🗓 MONTHLY LEADERBOARD (🔥 REAL VALUE)
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const now = new Date();

    // 🔥 FIXED UTC START OF MONTH
    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    ));

    const data = await Donation.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: start },
          finalPoints: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$userId",
          total: { $sum: "$finalPoints" }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          total: 1
        }
      }
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getSmartUserLeaderboard = async (req, res) => {
  const users = await User.find();

  const ranked = users.map((u) => {
    const credits = u.credits || 0;
    const trust = credits > 0 ? (u.trustScore || 0) : 0;


    // simple activity proxy (you can improve later)
    const activity = credits > 0
  ? Math.log(credits + 1) * 10
  : 0;


    const score =
  credits * 0.7 +
  trust * 0.1 +   // reduced weight
  activity * 0.2;

    return {
      _id: u._id,
      name: u.name,
      credits,
      trust,
      score: Number(score.toFixed(2))
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  res.json(ranked);
};

export const getSmartTeamLeaderboard = async (req, res) => {
  const teams = await Team.find();

  const ranked = teams.map((t) => {
    const points = t.totalPoints || 0;
    const trust = t.trustScore || 0;
    const activity = t.totalDonations || 0;

    const score =
      points * 0.6 +
      trust * 0.3 +
      activity * 0.1;

    return {
      _id: t._id,
      name: t.name,
      totalPoints: points,
      trust,
      score: Number(score.toFixed(2))
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  res.json(ranked);
};


export const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalDonations, totalTeams, accepted, total] =
      await Promise.all([
        User.countDocuments(),

        Donation.countDocuments({ status: 'approved' }),

        // 🔥 FIXED TEAM COUNT
        Team.countDocuments({
          members: { $exists: true, $not: { $size: 0 } }
        }),

        Donation.countDocuments({ status: 'approved' }),
        Donation.countDocuments()
      ]);

    // 🔥 BETTER LOGIC
    const trustRate =
      total === 0 ? 100 : Math.round((accepted / total) * 100);

    res.json({
      totalUsers,
      totalDonations,
      totalTeams,
      trustRate
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};