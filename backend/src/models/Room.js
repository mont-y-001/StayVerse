const mongoose = require('mongoose');
const modelOptions = require('../utils/modelOptions');

const roomSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  maxcount: { type: Number, required: true, min: 1 },
  phonenumber: { type: String, required: true, trim: true },
  rentperday: { type: Number, required: true, min: 1 },
  imageurls: [{ type: String, trim: true }],
  currentbooking: [{ type: String }],
  type: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
}, modelOptions);

module.exports = mongoose.model('Room', roomSchema);
