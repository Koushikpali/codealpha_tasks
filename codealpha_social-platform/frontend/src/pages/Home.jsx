import { useState, useEffect, useCallback } from "react";
import { postAPI } from "../api/posts";
import PostCard from "../components/posts/PostCard";
import CreatePost from "../components/posts/CreatePost";
import Suggestions from "../components/profile/Suggestions";
import Spinner from "../components/common/Spinner";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState("global"); // "global" | "feed"

  const loadPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = tab === "global"
        ? await postAPI.getAll(pageNum)
        : await postAPI.getFeed(pageNum);
      const newPosts = data.posts;
      setPosts((prev) => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(pageNum < data.pagination.pages);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); setLoadingMore(false); }
  }, [tab]);

  useEffect(() => {
    setPage(1);
    loadPosts(1, true);
  }, [tab]);

  const handlePostCreated = (post) => setPosts((prev) => [post, ...prev]);
  const handlePostDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));
  const handlePostUpdated = (updated) => setPosts((prev) => prev.map((p) => p._id === updated._id ? { ...p, ...updated } : p));

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main feed */}
      <div className="lg:col-span-2">
        <CreatePost onCreated={handlePostCreated} />

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-surface-raised border border-surface-border rounded-xl p-1">
          {[["global", "⚡ Global"], ["feed", "👥 Following"]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2 text-sm font-display font-semibold rounded-lg transition-all duration-200 ${tab === val ? "bg-brand-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-2 w-1/4" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">{tab === "feed" ? "👥" : "📭"}</p>
            <p className="font-display font-semibold text-white mb-1">
              {tab === "feed" ? "Your feed is empty" : "No posts yet"}
            </p>
            <p className="text-gray-500 text-sm">
              {tab === "feed" ? "Follow some developers to see their posts here" : "Be the first to post something!"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handlePostDeleted} onUpdate={handlePostUpdated} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button onClick={loadMore} disabled={loadingMore} className="btn-ghost border border-surface-border px-6 py-2.5 flex items-center gap-2">
                  {loadingMore ? <Spinner size="sm" /> : null}
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Suggestions />
        <div className="card p-4">
          <h3 className="font-display font-semibold text-sm text-gray-400 mb-3 uppercase tracking-wider">About DevConnect</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            A social platform built for developers. Share ideas, follow peers, and grow your network.
          </p>
          <div className="mt-3 pt-3 border-t border-surface-border flex gap-4 text-xs text-gray-600">
            <span>🚀 MERN Stack</span>
            <span>🔒 JWT Auth</span>
            <span>⚡ Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
