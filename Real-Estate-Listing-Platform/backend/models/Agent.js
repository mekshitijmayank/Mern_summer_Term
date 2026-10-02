const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  photo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  agency: {
    type: String,
    required: [true, 'Please add an agency name']
  },
  bio: String,
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  listings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Agent', agentSchema);
