const mongoose = require('mongoose');
const modelOptions = require('../utils/modelOptions');

const bookingSchema = new mongoose.Schema({
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromdate: { type: String, required: true },
  todate: { type: String, required: true },
  totalamount: { type: Number, required: true },
  totaldays: { type: Number, required: true },
  transaction_id: { type: String, default: '' },
  payment_method: { type: String, default: 'card' },
  status: { type: String, enum: ['booked', 'confirmed', 'cancelled'], default: 'booked' },
}, modelOptions);

module.exports = mongoose.model('Booking', bookingSchema);
