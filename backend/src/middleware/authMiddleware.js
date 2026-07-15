const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin' && !req.user?.is_admin) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
}

function ownerOnly(req, res, next) {
  if (req.user?.role !== 'owner' && req.user?.role !== 'admin' && !req.user?.is_admin) {
    return res.status(403).json({ message: 'Owner access required.' });
  }
  next();
}

function userOnly(req, res, next) {
  if ((req.user?.role || 'user') !== 'user') {
    return res.status(403).json({ message: 'Only guest accounts can create bookings.' });
  }
  next();
}

module.exports = { protect, adminOnly, ownerOnly, userOnly };
