const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  name: {
    type: String,
    required: [true, 'Please add your name']
  },
  email: {
    type: String,
    required: [true, 'Please add your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add your phone number']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  requestType: {
    type: String,
    enum: ['call', 'property-visit', 'video-meeting', 'general'],
    default: 'general'
  },
  preferredDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'visit-scheduled', 'negotiation', 'pending-verification', 'completed', 'closed'],
    default: 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
