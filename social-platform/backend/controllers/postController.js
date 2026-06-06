const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, image, tags } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      image: image || "",
      tags: tags || [],
    });

    const populated = await post.populate("author", "username profileImage");
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (global feed) with pagination
// @route   GET /api/posts?page=1&limit=10
// @access  Private
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    // Attach comment counts
    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount, isLiked: post.likes.includes(req.user._id) };
      })
    );

    res.json({
      success: true,
      posts: postsWithMeta,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get following feed
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const authorIds = [...user.following, req.user._id];
    const total = await Post.countDocuments({ author: { $in: authorIds } });

    const posts = await Post.find({ author: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), commentCount, isLiked: post.likes.includes(req.user._id) };
      })
    );

    res.json({
      success: true,
      posts: postsWithMeta,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username profileImage bio");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .populate("author", "username profileImage");

    res.json({
      success: true,
      post: { ...post.toObject(), isLiked: post.likes.includes(req.user._id), commentCount: comments.length },
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (owner only)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this post" });
    }

    const { content, image, tags } = req.body;
    post.content = content || post.content;
    post.image = image !== undefined ? image : post.image;
    post.tags = tags || post.tags;

    await post.save();
    const updated = await post.populate("author", "username profileImage");

    res.json({ success: true, post: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (owner only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
    } else {
      await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } });
    }

    const updated = await Post.findById(req.params.id);
    res.json({
      success: true,
      isLiked: !alreadyLiked,
      likesCount: updated.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, getAllPosts, getFeed, getPostById, updatePost, deletePost, toggleLike };
