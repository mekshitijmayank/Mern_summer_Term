const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a property title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a property description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  type: {
    type: String,
    required: true,
    enum: ['sale', 'rent']
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'villa', 'plot', 'commercial']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please specify the number of bedrooms']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please specify the number of bathrooms']
  },
  areaSqft: {
    type: Number,
    required: [true, 'Please specify the area in sqft']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'Please specify the city']
    },
    state: String,
    zip: String,
    country: {
      type: String,
      default: ''
    }
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please specify the coordinates [lng, lat]']
    }
  },
  images: {
    type: [String],
    required: [true, 'Please add property images'],
    validate: {
      validator: function(val) {
        return val.length >= 3 && val.length <= 10;
      },
      message: 'Property must have between 3 and 10 images.'
    }
  },
  brochureUrl: {
    type: String,
    default: null
  },
  amenities: {
    type: [String],
    default: []
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Set up 2dsphere index for location search
propertySchema.index({ location: '2dsphere' });

// Set up text index for text search
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  'address.city': 'text',
  'address.street': 'text',
  'address.country': 'text'
});

// Single and compound indexes for filter search optimization
propertySchema.index({ type: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ 'address.country': 1, 'address.city': 1 });

module.exports = mongoose.model('Property', propertySchema);
