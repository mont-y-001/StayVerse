const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, adminOnly, userOnly, ownerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

function withRoomShape(booking) {
  const json = booking.toJSON();
  json.rooms = json.room_id && typeof json.room_id === 'object' ? json.room_id : null;
  json.room_id = json.rooms?.id || json.room_id;
  return json;
}

router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate('room_id', 'name imageurls rentperday')
      .sort({ created_at: -1 });
    res.json(bookings.map(withRoomShape));
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, adminOnly, async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('room_id', 'name imageurls rentperday')
      .sort({ created_at: -1 });
    res.json(bookings.map(withRoomShape));
  } catch (error) {
    next(error);
  }
});

router.get('/owner', protect, ownerOnly, async (req, res, next) => {
  try {
    const rooms = await Room.find({ owner_id: req.user.id }).select('_id');
    const bookings = await Booking.find({ room_id: { $in: rooms.map(room => room._id) } })
      .populate('room_id', 'name imageurls rentperday')
      .populate('user_id', 'name email')
      .sort({ created_at: -1 });
    res.json(bookings.map(withRoomShape));
  } catch (error) { next(error); }
});

router.post('/', protect, userOnly, async (req, res, next) => {
  try {
    const { room_id, fromdate, todate } = req.body;
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const parseDate = (value) => {
      const match = /^([0-3]\d)-([01]\d)-(\d{4})$/.exec(value || '');
      if (!match) return null;
      const date = new Date(Date.UTC(match[3], Number(match[2]) - 1, match[1]));
      return Number.isNaN(date.getTime()) ? null : date;
    };
    const start = parseDate(fromdate);
    const end = parseDate(todate);
    if (!start || !end || end < start) return res.status(400).json({ message: 'Provide a valid date range (DD-MM-YYYY).' });

    const conflicts = await Booking.find({ room_id, status: { $ne: 'cancelled' } });
    const overlaps = conflicts.some((booking) => {
      const bookedStart = parseDate(booking.fromdate);
      const bookedEnd = parseDate(booking.todate);
      return bookedStart && bookedEnd && start <= bookedEnd && end >= bookedStart;
    });
    if (overlaps) return res.status(409).json({ message: 'This property is unavailable for the selected dates.' });

    const totaldays = Math.floor((end - start) / 86400000) + 1;
    const booking = await Booking.create({
      room_id,
      user_id: req.user.id,
      fromdate,
      todate,
      totalamount: totaldays * room.rentperday,
      totaldays,
      status: 'confirmed',
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
