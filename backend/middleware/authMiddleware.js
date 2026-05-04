import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }

      req.user = user;

      next();
      return;

    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ msg: 'No token' });
};