const User = require("../models/User");
const Post = require("../models/Post");

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profileImage");

    res.json({ success: true, user, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { bio, profileImage, username } = req.body;

    // Check username uniqueness if being changed
    if (username && username !== req.user.username) {
      const taken = await User.findOne({ username });
      if (taken) {
        return res.status(400).json({ success: false, message: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { ...(bio !== undefined && { bio }), ...(profileImage && { profileImage }), ...(username && { username }) },
      { new: true, runValidators: true }
    ).populate("followers following", "username profileImage");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const alreadyFollowing = userToFollow.followers.includes(req.user._id);
    if (alreadyFollowing) {
      return res.status(400).json({ success: false, message: "You are already following this user" });
    }

    // Add to target's followers
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
    // Add to current user's following
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });

    res.json({ success: true, message: `You are now following ${userToFollow.username}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });

    res.json({ success: true, message: `You have unfollowed ${userToUnfollow.username}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("username profileImage bio followers")
      .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users (people not followed)
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] },
    })
      .select("username profileImage bio followers")
      .limit(5);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, followUser, unfollowUser, searchUsers, getSuggestions };
