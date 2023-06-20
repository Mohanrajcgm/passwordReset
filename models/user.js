const mongoose = require('mongoose')
const authSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim:true,
    required: true,
    unique: true,
    lowercase: true,
    required: 'Email is mandatory',
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('users', authSchema);
