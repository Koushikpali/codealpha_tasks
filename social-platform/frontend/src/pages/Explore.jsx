import { useState, useEffect } from "react";
import { postAPI } from "../api/posts";
import PostCard from "../components/posts/PostCard";
import Spinner from "../components/common/Spinner";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await postAPI.getAll(pageNum);
      setPosts((prev) => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(pageNum < data.pagination.pages);
    } catch {} finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { load(1); }, []);

  const handlePostDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));
  const handlePostUpdated = (u) => setPosts((prev) => prev.map((p) => p._id === u._id ? { ...p, ...u } : p));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white mb-1">🌐 Explore</h1>
        <p className="text-gray-500 text-sm">Discover posts from all developers on DevConnect</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} onDelete={handlePostDeleted} onUpdate={handlePostUpdated} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button onClick={() => { const next = page + 1; setPage(next); load(next); }} disabled={loadingMore}
                className="btn-ghost border border-surface-border px-6 py-2.5 flex items-center gap-2">
                {loadingMore && <Spinner size="sm" />}
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
