const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post cannot exceed 2000 characters"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual to get like count
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

// Virtual to populate comments count via Comment model (used separately)
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
