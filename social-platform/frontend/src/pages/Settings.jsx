import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/users";
import Avatar from "../components/common/Avatar";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || "", bio: user?.bio || "", profileImage: user?.profileImage || "" });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display font-bold text-2xl text-white mb-6">⚙️ Settings</h1>

      <div className="card p-6 mb-4">
        <h2 className="font-display font-semibold text-white mb-4">Edit Profile</h2>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-border">
          <Avatar src={form.profileImage || user?.profileImage} username={user?.username} size="xl" />
          <div>
            <p className="font-display font-semibold text-white">@{user?.username}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
            <input value={form.username} onChange={set("username")} className="input" placeholder="your_username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={set("bio")} className="input resize-none" rows={3}
              placeholder="Tell the dev community about yourself..." maxLength={200} />
            <p className="text-right text-xs text-gray-600 mt-1">{form.bio.length}/200</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Profile Image URL</label>
            <input value={form.profileImage} onChange={set("profileImage")} className="input" placeholder="https://your-image-url.com/photo.jpg" />
            <p className="text-xs text-gray-600 mt-1">Paste a URL to any image. Try using GitHub avatar or Gravatar.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-center">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card p-4 border-red-900/30">
        <h3 className="font-display font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-500 text-sm">Account deletion is not yet implemented in this version.</p>
      </div>
    </div>
  );
};

export default Settings;
