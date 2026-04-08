const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'business', 'teller', 'admin'], default: 'customer' },
  hashedPw: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
