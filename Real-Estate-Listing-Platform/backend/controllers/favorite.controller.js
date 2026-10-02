const Favorite = require('../models/Favorite');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Toggle favorite on a listing
// @route   POST /api/favorites/:propertyId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Check if already favorited
    const existingFav = await Favorite.findOne({ user: userId, property: propertyId });
    const user = await User.findById(userId);

    if (existingFav) {
      // Remove from favorites collection
      await Favorite.findOneAndDelete({ user: userId, property: propertyId });
      
      // Remove from user's favorites array
      if (user) {
        user.favorites = user.favorites.filter(id => id.toString() !== propertyId.toString());
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Property removed from favorites',
        isFavorited: false
      });
    } else {
      // Add to favorites collection
      await Favorite.create({ user: userId, property: propertyId });

      // Add to user's favorites array
      if (user && !user.favorites.includes(propertyId)) {
        user.favorites.push(propertyId);
        await user.save();
      }

      return res.status(201).json({
        success: true,
        message: 'Property added to favorites',
        isFavorited: true
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's favorites list
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch favorites and populate details
    const favorites = await Favorite.find({ user: userId }).populate({
      path: 'property',
      populate: {
        path: 'agent',
        select: 'name agency photo phone'
      }
    });

    // Map to list of properties
    const propertyList = favorites
      .filter(f => f.property !== null)
      .map(f => f.property);

    res.status(200).json({
      success: true,
      count: propertyList.length,
      data: propertyList
    });
  } catch (err) {
    next(err);
  }
};
