const express = require("express");
const router = express.Router();
const { getUserProfile, updateProfile, followUser, unfollowUser, searchUsers, getSuggestions } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// GET /api/users/search?q=query
router.get("/search", protect, searchUsers);

// GET /api/users/suggestions
router.get("/suggestions", protect, getSuggestions);

// GET /api/users/:username
router.get("/:username", getUserProfile);

// PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// POST /api/users/:id/follow
router.post("/:id/follow", protect, followUser);

// POST /api/users/:id/unfollow
router.post("/:id/unfollow", protect, unfollowUser);

module.exports = router;
