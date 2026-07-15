const express = require('express');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/authMiddleware');

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

router.post('/', protect, async (req, res, next) => {
  try {
    const booking = await Booking.create({
      room_id: req.body.room_id,
      user_id: req.user.id,
      fromdate: req.body.fromdate,
      todate: req.body.todate,
      totalamount: req.body.totalamount,
      totaldays: req.body.totaldays,
      status: req.body.status || 'booked',
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
