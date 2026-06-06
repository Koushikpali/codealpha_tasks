import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { postAPI } from "../../api/posts";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const tagArr = tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
      const { data } = await postAPI.create({ content, image, tags: tagArr });
      toast.success("Post published! 🚀");
      setContent("");
      setImage("");
      setTags("");
      setExpanded(false);
      onCreated?.(data.post);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-6">
      <div className="flex gap-3">
        <Avatar src={user?.profileImage} username={user?.username} size="md" className="flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <textarea
            placeholder="What's on your mind, dev? Share code, ideas, or questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            rows={expanded ? 4 : 2}
            maxLength={2000}
            className="input resize-none text-sm transition-all duration-200"
          />

          {expanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="input text-sm"
              />
              <input
                type="text"
                placeholder="Tags: react, javascript, nodejs (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-mono ${content.length > 1800 ? "text-red-400" : "text-gray-600"}`}>
              {content.length}/2000
            </span>
            <div className="flex gap-2">
              {expanded && (
                <button type="button" onClick={() => { setExpanded(false); setContent(""); setImage(""); setTags(""); }} className="btn-ghost text-sm py-1.5 px-3">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading || !content.trim()} className="btn-primary text-sm py-1.5">
                {loading ? "Publishing..." : "Publish →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
