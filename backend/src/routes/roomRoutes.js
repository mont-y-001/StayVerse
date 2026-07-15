const express = require('express');
const Room = require('../models/Room');
const { protect, adminOnly, ownerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

function isAdmin(user) {
  return user.role === 'admin' || user.is_admin;
}

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.type && req.query.type !== 'All Rooms' ? { type: req.query.type } : {};
    const rooms = await Room.find(filter).sort({ created_at: -1 });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

router.get('/mine', protect, ownerOnly, async (req, res, next) => {
  try {
    const filter = isAdmin(req.user) ? {} : { owner_id: req.user.id };
    res.json(await Room.find(filter).sort({ created_at: -1 }));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, ownerOnly, async (req, res, next) => {
  try {
    const room = await Room.create({ ...req.body, owner_id: req.user.id });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, ownerOnly, async (req, res, next) => {
  try {
    const filter = isAdmin(req.user) ? { _id: req.params.id } : { _id: req.params.id, owner_id: req.user.id };
    const room = await Room.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, ownerOnly, async (req, res, next) => {
  try {
    const filter = isAdmin(req.user) ? { _id: req.params.id } : { _id: req.params.id, owner_id: req.user.id };
    const room = await Room.findOneAndDelete(filter);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
