const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const Agent = require('../models/Agent');

// @desc    Submit an inquiry on a property or general contact form
// @route   POST /api/inquiries, POST /api/contact
// @access  Public
exports.createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, message, requestType, preferredDate, subject } = req.body;
    const propertyId = req.body.propertyId || req.body.property;

    let validPropertyId = null;
    if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
      const propertyExists = await Property.findById(propertyId);
      if (propertyExists) {
        validPropertyId = propertyExists._id;
      }
    }

    const inquiry = await Inquiry.create({
      property: validPropertyId,
      name: name || 'Anonymous User',
      email: email || 'no-email@provided.com',
      phone: phone || '',
      message: subject ? `[${subject}] ${message || ''}` : (message || ''),
      requestType: requestType || 'general',
      preferredDate: preferredDate || null
    });

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inquiries (Agent: only own listings; Admin: all)
// @route   GET /api/inquiries
// @access  Private (Agent/Admin)
exports.getInquiries = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admins see all inquiries
      query = Inquiry.find().populate({
        path: 'property',
        select: 'title address price type'
      });
    } else if (req.user.role === 'agent') {
      // Find agent profile linked to user
      const agent = await Agent.findOne({ email: req.user.email });
      if (!agent) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      // Find all property IDs listed by this agent
      const properties = await Property.find({ agent: agent._id }).select('_id');
      const propertyIds = properties.map(p => p._id);

      // Fetch inquiries for these properties
      query = Inquiry.find({ property: { $in: propertyIds } }).populate({
        path: 'property',
        select: 'title address price type'
      });
    } else if (req.user.role === 'buyer') {
      query = Inquiry.find({ email: req.user.email }).populate({
        path: 'property',
        select: 'title address price type'
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view inquiries'
      });
    }

    const inquiries = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry progress or submit a deal for admin verification
// @route   PATCH /api/inquiries/:id/status
// @access  Private (Agent/Admin)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ['contacted', 'visit-scheduled', 'negotiation', 'pending-verification', 'completed', 'closed'];
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid inquiry status' });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate('property');
    if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });

    if (req.user.role === 'agent') {
      const agent = await Agent.findOne({ email: req.user.email });
      if (!agent || inquiry.property.agent.toString() !== agent._id.toString()) {
        return res.status(403).json({ success: false, error: 'You can only update inquiries for your own listings' });
      }
      if (status === 'completed') {
        return res.status(403).json({ success: false, error: 'Only an admin can verify and complete a deal' });
      }
    }

    inquiry.status = status;
    await inquiry.save();
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
};
