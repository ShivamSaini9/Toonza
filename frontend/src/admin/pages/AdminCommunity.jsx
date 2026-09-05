import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin";

const AdminCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCommunityPosts({ limit: 40 });
      setPosts(res.data.data.posts);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this post from the community feed?")) return;
    try {
      await adminApi.deleteCommunityPost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Post removed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove post");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Community</h1>
      <p className="text-sm text-slate-400 mb-6">Moderate posts shared to the public gallery.</p>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-slate-500 text-sm">No community posts yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((p) => (
            <div key={p._id} className="rounded-2xl border border-amber-500/15 overflow-hidden bg-white/[0.02]">
              <img src={p.url} alt={p.prompt} className="w-full aspect-square object-cover" />
              <div className="p-3">
                <p className="text-xs text-slate-400 line-clamp-2 mb-1">{p.prompt}</p>
                <p className="text-xs text-slate-500 mb-2">{p.uploadedBy?.fullName}</p>
                <button
                  onClick={() => remove(p._id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;
