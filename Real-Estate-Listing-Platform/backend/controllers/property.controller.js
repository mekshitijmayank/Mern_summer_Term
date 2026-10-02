const Property = require('../models/Property');
const Agent = require('../models/Agent');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all properties (with filtering, search, sorting, geo, pagination)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    // Map country query to nested address.country
    if (req.query.country) {
      req.query['address.country'] = { $regex: new RegExp(req.query.country, 'i') };
      delete req.query.country;
    }

    // Map city query to nested address.city
    if (req.query.city) {
      req.query['address.city'] = { $regex: new RegExp(req.query.city, 'i') };
      delete req.query.city;
    }

    if (req.query.state) {
      req.query['address.state'] = { $regex: new RegExp(req.query.state, 'i') };
      delete req.query.state;
    }

    // Determine if we need total count for pagination calculations
    const featuresForCount = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .geoFilter();
    const totalCount = await featuresForCount.query.countDocuments();

    // Execute query with pagination and sorting
    const features = new APIFeatures(Property.find().populate('agent'), req.query)
      .filter()
      .search()
      .geoFilter()
      .sort()
      .paginate();
      
    const properties = await features.query;

    res.status(200).json({
      success: true,
      count: properties.length,
      total: totalCount,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent');

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
exports.createProperty = async (req, res, next) => {
  try {
    // 1. Ensure user is an agent or admin
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only agents or admins can create property listings'
      });
    }

    // 2. Fetch or dynamically create the Agent record linked to this user
    let agent = await Agent.findOne({ email: req.user.email });
    if (!agent) {
      agent = await Agent.create({
        name: req.user.name,
        email: req.user.email,
        phone: '555-0100', // default template phone
        agency: 'Estate Premium Properties',
        bio: 'Premium real estate specialist.'
      });
    }

    // 3. Prepare property data
    const propertyData = { ...req.body };
    propertyData.agent = agent._id;

    // Parse address if passed as string
    if (typeof propertyData.address === 'string') {
      try {
        propertyData.address = JSON.parse(propertyData.address);
      } catch (e) {}
    }

    // Validate Country field
    if (!propertyData.address || !propertyData.address.country || propertyData.address.country.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Address country is required'
      });
    }

    // Parse location coordinates if passed as string
    if (typeof propertyData.location === 'string') {
      try {
        propertyData.location = JSON.parse(propertyData.location);
      } catch (e) {
        // default coordinates [lng, lat]
        propertyData.location = { type: 'Point', coordinates: [-80.19179, 25.76168] };
      }
    }

    // Resolve images
    let imagesList = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      imagesList = req.files.images.map(file => {
        return file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))
          ? file.path
          : `/uploads/${file.filename}`;
      });
    } else if (req.body.images) {
      imagesList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Enforce 3 to 10 images limit
    if (imagesList.length < 3 || imagesList.length > 10) {
      return res.status(400).json({
        success: false,
        error: `Property listing requires between 3 and 10 images. You provided ${imagesList.length}.`
      });
    }
    propertyData.images = imagesList;

    // Handle uploaded brochure (PDF check)
    if (req.files && req.files.brochure && req.files.brochure.length > 0) {
      const brochureFile = req.files.brochure[0];
      if (brochureFile.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Only PDF files are accepted for the brochure'
        });
      }
      propertyData.brochureUrl = brochureFile.path && (brochureFile.path.startsWith('http://') || brochureFile.path.startsWith('https://'))
        ? brochureFile.path
        : `/uploads/${brochureFile.filename}`;
    }

    // Parse amenities if passed as string
    if (typeof propertyData.amenities === 'string') {
      try {
        propertyData.amenities = JSON.parse(propertyData.amenities);
      } catch (e) {
        propertyData.amenities = propertyData.amenities.split(',').map(a => a.trim());
      }
    }

    // Create property in DB
    const property = await Property.create(propertyData);

    // Link listing in Agent array
    agent.listings.push(property._id);
    await agent.save();

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent/Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Validate listing ownership (unless Admin)
    if (req.user.role !== 'admin') {
      const agent = await Agent.findOne({ email: req.user.email });
      if (!agent || property.agent.toString() !== agent._id.toString()) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this listing'
        });
      }
    }

    // Parse address if passed as string/JSON
    let addressData = req.body.address;
    if (typeof addressData === 'string') {
      try {
        addressData = JSON.parse(addressData);
      } catch (e) {}
    }
    
    // Validate country if address is being updated
    if (addressData) {
      if (!addressData.country || addressData.country.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Address country is required'
        });
      }
      req.body.address = addressData;
    }

    // Parse coordinates if passed as string
    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (e) {}
    }

    // Parse amenities if passed as string
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    // Resolve images
    let updatedImages = [];
    if (req.body.images) {
      updatedImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadedImageUrls = req.files.images.map(file => {
        return file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))
          ? file.path
          : `/uploads/${file.filename}`;
      });
      updatedImages = [...updatedImages, ...uploadedImageUrls];
    }

    // Enforce images boundaries
    if (updatedImages.length < 3 || updatedImages.length > 10) {
      return res.status(400).json({
        success: false,
        error: `Property listing requires between 3 and 10 images. Currently resolved: ${updatedImages.length}.`
      });
    }
    req.body.images = updatedImages;

    // Handle PDF Brochure update
    if (req.files && req.files.brochure && req.files.brochure.length > 0) {
      const brochureFile = req.files.brochure[0];
      if (brochureFile.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Only PDF files are accepted for the brochure'
        });
      }
      req.body.brochureUrl = brochureFile.path && (brochureFile.path.startsWith('http://') || brochureFile.path.startsWith('https://'))
        ? brochureFile.path
        : `/uploads/${brochureFile.filename}`;
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent/Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Validate listing ownership (unless Admin)
    const agent = await Agent.findOne({ email: req.user.email });
    if (req.user.role !== 'admin') {
      if (!agent || property.agent.toString() !== agent._id.toString()) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to delete this listing'
        });
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    // Remove from agent listings list
    if (agent) {
      agent.listings = agent.listings.filter(
        id => id.toString() !== req.params.id.toString()
      );
      await agent.save();
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
