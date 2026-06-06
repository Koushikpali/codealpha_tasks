import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const Suggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getSuggestions()
      .then(({ data }) => setSuggestions(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (id, username) => {
    try {
      await userAPI.follow(id);
      setFollowing((prev) => new Set([...prev, id]));
      toast.success(`Following @${username}`);
    } catch { toast.error("Could not follow user"); }
  };

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="font-display font-semibold text-sm text-gray-400 mb-3 uppercase tracking-wider">Who to Follow</h3>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((n) => <div key={n} className="skeleton h-12 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((u) => (
            <div key={u._id} className="flex items-center gap-3">
              <Link to={`/profile/${u.username}`}>
                <Avatar src={u.profileImage} username={u.username} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${u.username}`} className="text-sm font-medium text-white hover:text-brand-400 transition-colors block truncate">
                  @{u.username}
                </Link>
                <p className="text-xs text-gray-600">{u.followers?.length || 0} followers</p>
              </div>
              {!following.has(u._id) ? (
                <button onClick={() => handleFollow(u._id, u.username)}
                  className="text-xs font-display font-semibold text-brand-400 hover:text-brand-300 border border-brand-700 hover:border-brand-500 px-2.5 py-1 rounded-lg transition-all flex-shrink-0">
                  Follow
                </button>
              ) : (
                <span className="text-xs text-gray-500 flex-shrink-0">Following ✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggestions;
