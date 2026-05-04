import Team from '../models/Team.js';
import User from '../models/User.js';

// CREATE TEAM
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    // ❌ prevent multiple teams
    const user = await User.findById(req.user._id);
    if (user.teamId) {
      return res.status(400).json({ msg: 'You already have a team' });
    }

    // ❌ unique team name
    const exists = await Team.findOne({ name });
    if (exists) {
      return res.status(400).json({ msg: 'Team name already exists' });
    }

    const team = await Team.create({
      name,
      leader: req.user._id,
     members: [{
  user: req.user._id
}]
    });

    user.teamId = team._id;
    await user.save();

    res.json(team);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// JOIN TEAM
export const joinTeam = async (req, res) => {
  try {
    const { teamId } = req.body;

    const user = await User.findById(req.user._id);

    // ❌ already in a team
    if (user.teamId) {
      return res.status(400).json({ msg: 'You are already in a team' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // ✅ FIX: correct membership check (IMPORTANT)
    const alreadyMember = team.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ msg: 'Already in team' });
    }

    // ✅ ADD USER
    team.members.push({
      user: user._id
    });

    await team.save();

    // ✅ UPDATE USER
    user.teamId = team._id;
    await user.save();

    res.json({
      msg: 'Joined team successfully',
      team
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL TEAMS
export const getTeams = async (req, res) => {
  try {
   const teams = await Team.find({
  members: { $exists: true, $ne: [] } // 🔥 FILTER EMPTY TEAMS
})
.select('name members totalPoints totalDonations acceptedDonations trustScore');
    res.json(teams);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateTeamName = async (req, res) => {
  try {
    const { name } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    // only leader can edit
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only leader can edit team' });
    }

    // unique name check
    const exists = await Team.findOne({ name });
    if (exists) {
      return res.status(400).json({ msg: 'Name already taken' });
    }

    team.name = name;
    await team.save();

    res.json(team);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.teamId) {
      return res.json(null);
    }

    const team = await Team.findById(user.teamId)
      .populate('leader', 'name email')
      .populate('members.user', 'name credits');

    let totalCredits = 0;

    const members = team.members.map((m) => {
      totalCredits += m.user.credits;

      const days =
        Math.floor((Date.now() - new Date(m.joinedAt)) / (1000 * 60 * 60 * 24));

      return {
        _id: m.user._id,
        name: m.user.name,
        credits: m.user.credits,
        seniorityDays: days
      };
    });

    res.json({
      _id: team._id,
      teamName: team.name,
      leader: team.leader,
      totalMembers: members.length,
      totalCredits,

      // 🔥 ADD THESE (YOU MISSED THIS)
      totalDonations: team.totalDonations || 0,
      acceptedDonations: team.acceptedDonations || 0,
      trustScore: team.trustScore || 0,

      members
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const changeLeader = async (req, res) => {
  try {
    const { newLeaderId } = req.body;

    const team = await Team.findById(req.params.id);

    // only current leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Only leader can change leader' });
    }

    team.leader = newLeaderId;
    await team.save();

    res.json({ msg: 'Leader updated' });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.teamId) {
      return res.status(400).json({ msg: 'Not in a team' });
    }

    const team = await Team.findById(user.teamId).populate('members.user');

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // ✅ REMOVE USER FROM TEAM
    team.members = team.members.filter(
      (m) => m.user._id.toString() !== user._id.toString()
    );

    // ✅ REMOVE TEAM FROM USER
    user.teamId = null;
    await user.save();

    // 🔥 CASE 1: TEAM EMPTY → DELETE
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(team._id);
      return res.json({ msg: 'Team deleted (no members left)' });
    }

    // 🔥 CASE 2: LEADER LEFT → ASSIGN NEW LEADER (HIGHEST CREDITS)
    if (team.leader.toString() === user._id.toString()) {
      
      let newLeader = team.members[0];

      for (const member of team.members) {
        if (
          member.user.credits > newLeader.user.credits
        ) {
          newLeader = member;
        }
      }

      team.leader = newLeader.user._id;
    }

    await team.save();

    res.json({ msg: 'Left team successfully' });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

