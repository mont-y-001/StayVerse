const mongoose = require('mongoose');
const modelOptions = require('../utils/modelOptions');

const propertyRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  maxcount: { type: Number, required: true, min: 1 },
  phonenumber: { type: String, required: true, trim: true },
  rentperday: { type: Number, required: true, min: 1 },
  imageurls: [{ type: String, trim: true }],
  type: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, modelOptions);

module.exports = mongoose.model('PropertyRequest', propertyRequestSchema);
