const express = require('express');
const PropertyRequest = require('../models/PropertyRequest');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, async (req, res, next) => {
  try {
    const requests = await PropertyRequest.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, adminOnly, async (_req, res, next) => {
  try {
    const requests = await PropertyRequest.find().sort({ created_at: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const request = await PropertyRequest.create({
      ...req.body,
      user_id: req.user.id,
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const request = await PropertyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Property request not found.' });

    await Room.create({
      owner_id: request.user_id,
      name: request.name,
      type: request.type,
      description: request.description,
      maxcount: request.maxcount,
      rentperday: request.rentperday,
      phonenumber: request.phonenumber,
      imageurls: request.imageurls,
    });

    request.status = 'approved';
    await request.save();
    res.json(request);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/reject', protect, adminOnly, async (req, res, next) => {
  try {
    const request = await PropertyRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Property request not found.' });
    res.json(request);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
