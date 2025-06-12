const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config(); 

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found for this token');
      }

      next(); 
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      if (error.name === 'JsonWebTokenError') {
        return res.json({ message: 'Not authorized, token failed verification' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.json({ message: 'Not authorized, token expired' });
      }
      return res.json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401);
    return res.json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };