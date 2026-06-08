const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, getFeed, getPostById, updatePost, deletePost, toggleLike } = require("../controllers/postController");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

// All post routes require authentication
router.use(protect);

// GET  /api/posts         - global feed
// POST /api/posts         - create post
router.route("/").get(getAllPosts).post(createPost);

// GET /api/posts/feed     - following-only feed
router.get("/feed", getFeed);

// GET    /api/posts/:id   - single post
// PUT    /api/posts/:id   - update post
// DELETE /api/posts/:id   - delete post
router.route("/:id").get(getPostById).put(updatePost).delete(deletePost);

// POST /api/posts/:id/like
router.post("/:id/like", toggleLike);

// Comment sub-routes
router.route("/:postId/comments").post(addComment).get(getComments);
router.delete("/comments/:id", deleteComment);

module.exports = router;
