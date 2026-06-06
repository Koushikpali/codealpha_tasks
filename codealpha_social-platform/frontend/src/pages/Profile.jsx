import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { userAPI } from "../api/users";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import Avatar from "../components/common/Avatar";
import toast from "react-hot-toast";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", profileImage: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("posts");

  const isOwn = currentUser?.username === username;
  const isFollowing = profile?.followers?.some((f) => f._id === currentUser?._id || f === currentUser?._id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getProfile(username);
        setProfile(data.user);
        setPosts(data.posts);
        setEditForm({ bio: data.user.bio || "", profileImage: data.user.profileImage || "", username: data.user.username });
      } catch { toast.error("User not found"); } finally { setLoading(false); }
    };
    load();
  }, [username]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollow(profile._id);
        setProfile((p) => ({ ...p, followers: p.followers.filter((f) => (f._id || f) !== currentUser._id) }));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await userAPI.follow(profile._id);
        setProfile((p) => ({ ...p, followers: [...p.followers, { _id: currentUser._id }] }));
        toast.success(`Following @${profile.username}`);
      }
    } catch (e) { toast.error(e.response?.data?.message || "Action failed"); } finally { setFollowLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(editForm);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e) { toast.error(e.response?.data?.message || "Update failed"); } finally { setSaving(false); }
  };

  const handlePostDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));
  const handlePostUpdated = (updated) => setPosts((prev) => prev.map((p) => p._id === updated._id ? { ...p, ...updated } : p));

  if (loading) return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 mb-4">
        <div className="flex gap-4 mb-4">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="skeleton h-5 w-1/3" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20"><p className="text-gray-500">User not found.</p></div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar src={profile.profileImage} username={profile.username} size="xl" className="flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between mb-2">
              <div>
                <h1 className="font-display font-bold text-2xl text-white">@{profile.username}</h1>
                <p className="text-gray-500 text-sm">{profile.email}</p>
              </div>

              {isOwn ? (
                <button onClick={() => setEditing((o) => !o)} className="btn-ghost border border-surface-border text-sm py-1.5">
                  {editing ? "Cancel" : "✏️ Edit Profile"}
                </button>
              ) : (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`px-4 py-1.5 rounded-xl text-sm font-display font-semibold transition-all ${isFollowing ? "bg-surface-hover border border-surface-border text-gray-300 hover:border-red-700 hover:text-red-400" : "btn-primary"}`}>
                  {followLoading ? "..." : isFollowing ? "Following" : "+ Follow"}
                </button>
              )}
            </div>

            {/* Bio */}
            {!editing && (
              <p className="text-gray-300 text-sm mb-3">{profile.bio || <span className="text-gray-600 italic">No bio yet</span>}</p>
            )}

            {/* Stats */}
            <div className="flex gap-5 text-sm">
              <div><span className="font-display font-bold text-white">{posts.length}</span> <span className="text-gray-500">posts</span></div>
              <div><span className="font-display font-bold text-white">{profile.followers?.length || 0}</span> <span className="text-gray-500">followers</span></div>
              <div><span className="font-display font-bold text-white">{profile.following?.length || 0}</span> <span className="text-gray-500">following</span></div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-5 pt-5 border-t border-surface-border space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Username</label>
              <input value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Bio</label>
              <textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                className="input text-sm resize-none" rows={2} maxLength={200} placeholder="Tell devs about yourself..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Profile Image URL</label>
              <input value={editForm.profileImage} onChange={(e) => setEditForm((f) => ({ ...f, profileImage: e.target.value }))}
                className="input text-sm" placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-surface-raised border border-surface-border rounded-xl p-1">
        {[["posts", "Posts"], ["about", "About"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2 text-sm font-display font-semibold rounded-lg transition-all ${tab === val ? "bg-brand-600 text-white" : "text-gray-500 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === "posts" && (
        posts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-gray-500">{isOwn ? "You haven't posted yet." : `@${profile.username} hasn't posted yet.`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} onDelete={handlePostDeleted} onUpdate={handlePostUpdated} />
            ))}
          </div>
        )
      )}

      {tab === "about" && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1">Bio</p>
            <p className="text-gray-300 text-sm">{profile.bio || "No bio provided."}</p>
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-1">Member since</p>
            <p className="text-gray-300 text-sm">{new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-3">Followers ({profile.followers?.length})</p>
            <div className="flex flex-wrap gap-2">
              {profile.followers?.slice(0, 12).map((f) => (
                <a key={f._id || f} href={`/profile/${f.username}`} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-800/30 px-2 py-1 rounded-lg">
                  @{f.username || "user"}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
