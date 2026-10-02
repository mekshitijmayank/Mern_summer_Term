const User = require('../models/User');
const Agent = require('../models/Agent');

// @desc    List accounts for the admin operations dashboard
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role phone photo createdAt').sort('createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign or remove an agent role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['buyer', 'agent'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Admin can assign buyer or agent access only' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = role;
    await user.save();

    if (role === 'agent') {
      await Agent.findOneAndUpdate(
        { email: user.email },
        { $setOnInsert: { name: user.name, email: user.email, phone: user.phone || '', agency: 'GharFind' } },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};