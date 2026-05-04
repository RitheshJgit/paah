import Task from '../models/Task.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import TaskSubmission from '../models/TaskSubmission.js';
import { sendTaskApprovedEmail } from '../services/emailService.js';


// ✅ CREATE TASK (ADMIN)
export const createTask = async (req, res) => {
  try {
    const { title, description, type, creditPoints, maxTeams, deadline } = req.body;

    if (!title || !type || !creditPoints || !deadline) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const parsedDeadline = new Date(deadline);

    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ msg: "Invalid deadline" });
    }

    if (parsedDeadline <= new Date()) {
      return res.status(400).json({ msg: "Deadline must be in future" });
    }

    const task = await Task.create({
      title,
      description,
      type,
      creditPoints: Number(creditPoints),
      maxTeams: type === 'common' ? null : Number(maxTeams),
      deadline: parsedDeadline,
      createdBy: req.user._id
    });

    res.json(task);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const joinTask = async (req, res) => {
  const { taskId } = req.body;

  const user = await User.findById(req.user._id);

  if (!user.teamId) {
    return res.status(400).json({ msg: 'Join a team first' });
  }

  const task = await Task.findById(taskId);

  // ❌ if full
  if (task.maxTeams && task.teamsJoined.length >= task.maxTeams) {
    return res.status(400).json({ msg: 'Task full' });
  }

  // ❌ already joined
  if (task.teamsJoined.includes(user.teamId)) {
    return res.status(400).json({ msg: 'Already joined' });
  }

  task.teamsJoined.push(user.teamId);

  await task.save();

  res.json({ msg: 'Joined task' });
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    const submissions = await TaskSubmission.find({
      userId: req.user._id
    });

    res.json({
      tasks,
      submissions
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ msg: 'Task ID required' });
    }

    const user = await User.findById(req.user._id);
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // 🔥 DEADLINE CHECK
    if (new Date() > new Date(task.deadline)) {
      return res.status(400).json({ msg: 'Task expired' });
    }

    if (!user.teamId) {
      return res.status(400).json({ msg: 'Join a team first' });
    }

    const already = await TaskSubmission.findOne({
      userId: user._id,
      taskId
    });

    if (already) {
      return res.status(400).json({ msg: 'Already accepted this task' });
    }

    // 🔥 FIXED CATEGORY CHECK
    const existingSubmissions = await TaskSubmission.find({
      userId: user._id,
      status: { $in: ['pending', 'completed'] }
    }).populate('taskId');

    const alreadyInCategory = existingSubmissions.some(
      (s) => s.taskId && s.taskId.type === task.type
    );

    if (alreadyInCategory) {
      return res.status(400).json({
        msg: `You can only do one ${task.type} task at a time`
      });
    }

    // ✅ FIXED CREATE
    const submission = await TaskSubmission.create({
      taskId,
      userId: user._id,
      teamId: user.teamId,
      status: 'pending',
      completed: false
    });

    res.json({
      msg: 'Task accepted successfully',
      submission
    });

  } catch (err) {
    console.error("ACCEPT TASK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const submitTaskProof = async (req, res) => {
  try {
    const { submissionId, witnessName, witnessPhone } = req.body;

    // 🔍 Find submission + task
    const submission = await TaskSubmission.findById(submissionId)
      .populate('taskId');

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    // 🔥 DEADLINE CHECK
    if (new Date() > new Date(submission.taskId.deadline)) {
      return res.status(400).json({ msg: 'Deadline passed. Cannot submit proof' });
    }

    // 🔒 ONLY OWNER CAN SUBMIT
    if (submission.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // ❌ MUST COMPLETE TASK FIRST
    if (!submission.completed) {
      return res.status(400).json({ msg: 'Complete task first' });
    }

    // ❌ IMAGE REQUIRED
    if (!req.file) {
      return res.status(400).json({ msg: 'Proof image required' });
    }

    // ❌ WITNESS REQUIRED
    if (!witnessName || !witnessPhone) {
      return res.status(400).json({ msg: 'Witness details required' });
    }

    // ✅ SAVE IMAGE (Cloudinary URL)
    submission.proofImage = req.file.path;

    // ✅ SAVE WITNESS DATA
    submission.witnessName = witnessName;
    submission.witnessPhone = witnessPhone;

    // OPTIONAL: ensure status is pending
    submission.status = 'pending';

    await submission.save();

    // 🔥 RESPONSE (NO AI)
    res.json({
      msg: 'Proof submitted, waiting for approval',
      proofImage: submission.proofImage
    });

  } catch (err) {
    console.error("SUBMIT TASK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const verifyTask = async (req, res) => {
  try {
    const { submissionId, status } = req.body;

    const submission = await TaskSubmission.findById(submissionId)
      .populate('taskId');

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    // ❌ prevent re-verification
    if (submission.status !== 'pending') {
      return res.status(400).json({ msg: 'Already verified' });
    }

    // 🔥 APPLY STATUS
    submission.status = status;
    submission.verifiedBy = req.user._id;

    await submission.save();

    // ✅ CREDIT ONLY ON APPROVE (NO AI, NO DUPLICATE)
    if (status === 'approved') {
      const taskPoints = submission.taskId.creditPoints;

      // USER
      const user = await User.findByIdAndUpdate(
        submission.userId,
        { $inc: { credits: taskPoints } },
        { new: true }
      );

      // TEAM
      if (submission.teamId) {
        await Team.findByIdAndUpdate(submission.teamId, {
          $inc: { totalPoints: taskPoints }
        });
      }

      // 🔥 EMAIL (optional)
      sendTaskApprovedEmail(user, submission.taskId)
        .catch(err => console.log("Email failed:", err.message));
    }

    res.json({ msg: 'Task verified successfully' });

  } catch (err) {
    console.error("VERIFY TASK ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const getMyPendingTasks = async (req, res) => {
  try {
    const count = await TaskSubmission.countDocuments({
      userId: req.user._id,
      status: 'pending'
    });

    res.json({ count });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getPendingTasks = async (req, res) => {
  try {
    const tasks = await TaskSubmission.find({ status: 'pending' })
      .populate('userId', 'name')
      .populate('taskId', 'title');

    res.json(tasks);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await TaskSubmission.find({ userId: req.user._id })
      .populate('taskId');

    res.json(tasks);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllTaskSubmissions = async (req, res) => {
  try {
    const data = await TaskSubmission.find()
      .populate('userId', 'name')
      .populate('taskId', 'title');

    res.json(data);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const completeTask = async (req, res) => {
  const { submissionId } = req.body;

  const submission = await TaskSubmission.findById(submissionId)
    .populate('taskId');

  if (!submission) {
    return res.status(404).json({ msg: 'Submission not found' });
  }

  // 🔥 DEADLINE CHECK
  if (new Date() > new Date(submission.taskId.deadline)) {
    return res.status(400).json({ msg: 'Task expired' });
  }

  if (submission.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  if (submission.status !== 'pending') {
    return res.status(400).json({ msg: 'Task already processed' });
  }

  if (submission.completed) {
    return res.status(400).json({ msg: 'Already completed' });
  }

  submission.completed = true;
  submission.completedAt = new Date();

  await submission.save();

  res.json({ msg: 'Task marked as completed' });
};

export const isTaskExpired = (task) => {
  return new Date() > new Date(task.deadline);
};

