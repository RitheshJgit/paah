import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// import admin from '../config/firebaseAdmin.js';
import { sendResetPasswordEmail ,sendOTPEmail } from '../services/emailService.js';
import { generateToken } from '../utils/generateToken.js';

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔥 PASSWORD VALIDATION (STRONG)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({
      _id: user._id,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ msg: 'Invalid credentials' });
    }

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔐 GENERATE TOKEN
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // 🔥 SEND EMAIL (NON-BLOCKING)
    sendResetPasswordEmail(user, resetLink)
      .catch(err => console.log("Email failed:", err.message));

    res.json({ msg: "Reset email sent" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // 🔐 HASH NEW PASSWORD
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 🧹 CLEAR TOKEN
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 GENERATE 6 DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000; // 5 mins

    await user.save();

    // 🔥 SEND EMAIL
    sendOTPEmail(user, otp)
      .catch(err => console.log("Email failed:", err.message));

    res.json({ msg: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    let { email, otp, password } = req.body;

    // 🔥 NORMALIZE INPUT
    email = email?.trim().toLowerCase();
    const normalizedOTP = String(otp).trim();

    // 🔍 DEBUG (REMOVE LATER)
    console.log("Incoming:", { email, otp: normalizedOTP });

    // 🔎 FIND USER BY EMAIL FIRST
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("DB OTP:", user.resetOTP);
    console.log("Expires:", user.resetOTPExpire);

    // ❌ CHECK OTP MATCH
    if (user.resetOTP !== normalizedOTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // ❌ CHECK EXPIRY
    if (!user.resetOTPExpire || user.resetOTPExpire < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 🧹 CLEAR OTP
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// export const socialLogin = async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ msg: "Token missing" });
//     }

//     // 🔐 VERIFY FIREBASE TOKEN
//     const decoded = await admin.auth().verifyIdToken(token);

//     let user = await User.findOne({ email: decoded.email });

//     // 🆕 CREATE USER IF NOT EXISTS
//     if (!user) {
//   user = await User.create({
//     name: decoded.name || "User",
//     email: decoded.email,
//     password: "SOCIAL_LOGIN",

//     // 🔥 ADD THESE
//     role: "user",
//     credits: 0,
//     teamId: null
//   });
// }

//     res.json({
//   _id: user._id,
//   name: user.name,
//   email: user.email,
//   role: user.role,   // ✅ ADD THIS
//   token: generateToken(user._id)
// });

//   } catch (err) {
//     console.error("SOCIAL LOGIN ERROR:", err.message);
//     res.status(500).json({ msg: err.message });
//   }
// };
