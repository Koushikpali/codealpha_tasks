import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { postAPI } from "../../api/posts";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import CommentSection from "../comments/CommentSection";
import toast from "react-hot-toast";

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    setIsLiked((p) => !p);
    setLikes((p) => (isLiked ? p - 1 : p + 1));
    try {
      const { data } = await postAPI.toggleLike(post._id);
      setIsLiked(data.isLiked);
      setLikes(data.likesCount);
    } catch {
      // Revert
      setIsLiked((p) => !p);
      setLikes((p) => (isLiked ? p + 1 : p - 1));
      toast.error("Could not update like");
    } finally { setLikeLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await postAPI.delete(post._id);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch { toast.error("Could not delete post"); }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      const { data } = await postAPI.update(post._id, { content: editContent });
      toast.success("Post updated");
      setEditing(false);
      onUpdate?.(data.post);
    } catch { toast.error("Could not update post"); } finally { setEditLoading(false); }
  };

  return (
    <article className="card p-5 animate-slide-up hover:border-surface-hover transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.profileImage} username={post.author?.username} size="md" />
          <div>
            <p className="font-display font-semibold text-white group-hover:text-brand-400 transition-colors">
              @{post.author?.username}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu((o) => !o)}
              className="text-gray-600 hover:text-gray-300 p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-surface-card border border-surface-border rounded-xl shadow-xl z-10 animate-fade-in overflow-hidden">
                <button onClick={() => { setEditing(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-hover hover:text-white transition-colors">
                  ✏️ Edit
                </button>
                <button onClick={handleDelete}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/40 transition-colors">
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="mb-4">
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3}
            className="input resize-none text-sm mb-2" maxLength={2000} />
          <div className="flex gap-2">
            <button onClick={handleEdit} disabled={editLoading || !editContent.trim()} className="btn-primary text-sm py-1.5">
              {editLoading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setEditContent(post.content); }} className="btn-ghost text-sm py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Image */}
      {post.image && (
        <img src={post.image} alt="post" className="rounded-xl mb-4 w-full object-cover max-h-96 border border-surface-border" />
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-surface-border">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${isLiked ? "text-pink-400" : "text-gray-500 hover:text-pink-400"}`}>
          <span className={`text-lg transition-transform ${isLiked ? "scale-125" : "hover:scale-110"}`}>{isLiked ? "❤️" : "🤍"}</span>
          <span className="font-mono">{likes}</span>
        </button>

        <button onClick={() => setShowComments((o) => !o)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-400 transition-colors">
          <span className="text-lg">💬</span>
          <span className="font-mono">{commentCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection postId={post._id} onCountChange={setCommentCount} />
      )}
    </article>
  );
};

export default PostCard;
