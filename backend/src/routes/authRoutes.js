const express = require('express');
const User = require('../models/User');
const signToken = require('../utils/token');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

function authPayload(user) {
  return {
    token: signToken(user),
    user: user.toJSON(),
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json(authPayload(user));
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    res.json(authPayload(user));
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

module.exports = router;
