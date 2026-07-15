const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const modelOptions = require('../utils/modelOptions');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  // Kept for existing accounts created before roles were introduced.
  is_admin: { type: Boolean, default: false },
}, modelOptions);

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
