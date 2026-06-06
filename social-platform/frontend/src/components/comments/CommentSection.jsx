import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { postAPI } from "../../api/posts";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const CommentSection = ({ postId, onCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await postAPI.getComments(postId);
        setComments(data.comments);
        onCountChange?.(data.comments.length);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await postAPI.addComment(postId, { content: text });
      setComments((prev) => [...prev, data.comment]);
      onCountChange?.((c) => c + 1);
      setText("");
    } catch { toast.error("Failed to add comment"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await postAPI.deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      onCountChange?.((c) => c - 1);
    } catch { toast.error("Failed to delete comment"); }
  };

  return (
    <div className="mt-4 pt-4 border-t border-surface-border animate-fade-in">
      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Avatar src={user?.profileImage} username={user?.username} size="sm" className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            className="input text-sm py-2 flex-1"
          />
          <button type="submit" disabled={submitting || !text.trim()} className="btn-primary text-sm py-2 px-3 flex-shrink-0">
            {submitting ? "..." : "→"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map((n) => <div key={n} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2.5 group">
              <Avatar src={c.author?.profileImage} username={c.author?.username} size="sm" className="flex-shrink-0" />
              <div className="flex-1 bg-surface-raised rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-display font-semibold text-brand-400">@{c.author?.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    {user?._id === c.author?._id && (
                      <button onClick={() => handleDelete(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-400 transition-all">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
