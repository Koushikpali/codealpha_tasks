const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
