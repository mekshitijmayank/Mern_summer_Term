const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    const agents = await Agent.find().limit(limit);

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single agent details with their listings
// @route   GET /api/agents/:id
// @access  Public
exports.getAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('listings');

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (err) {
    next(err);
  }
};
