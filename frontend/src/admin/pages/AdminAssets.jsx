import { useEffect, useState } from "react";
import { UploadCloud, Trash2, Music2, Image as ImageIcon, Volume2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin";

const TYPE_ICON = { background: ImageIcon, bgm: Music2, sfx: Volume2 };
const TABS = [
  { value: "", label: "All" },
  { value: "background", label: "Backgrounds" },
  { value: "bgm", label: "BGM" },
  { value: "sfx", label: "SFX" },
];

const AdminAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", type: "background", category: "General", tags: "" });
  const [file, setFile] = useState(null);

  const fetchAssets = async (type = tab) => {
    setLoading(true);
    try {
      const res = await adminApi.getAssets({ type: type || undefined, limit: 60 });
      setAssets(res.data.data.assets);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a file to upload");
    if (!form.title.trim()) return toast.error("Give the asset a title");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", form.title);
      fd.append("type", form.type);
      fd.append("category", form.category);
      fd.append("tags", form.tags);

      await adminApi.createAsset(fd);
      toast.success("Asset uploaded");
      setForm({ title: "", type: form.type, category: "General", tags: "" });
      setFile(null);
      fetchAssets(tab);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (asset) => {
    try {
      const res = await adminApi.updateAsset(asset._id, { isPublished: !asset.isPublished });
      setAssets((prev) => prev.map((a) => (a._id === asset._id ? res.data.data : a)));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this asset permanently?")) return;
    try {
      await adminApi.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      toast.success("Asset deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Creator Assets</h1>
      <p className="text-sm text-slate-400 mb-6">Manage the free backgrounds, BGM, and SFX library.</p>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-amber-500/15 bg-white/[0.02] p-4 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div className="lg:col-span-1">
          <label className="block text-xs text-slate-400 mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            placeholder="Rainy street ambience"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
          >
            <option value="background">Background</option>
            <option value="bgm">BGM</option>
            <option value="sfx">SFX</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            placeholder="Sad, Action, City…"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
            placeholder="rain, night, calm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 truncate">
              {file ? file.name : "Choose file…"}
            </div>
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-medium text-white disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? "…" : "Upload"}
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              tab === t.value
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading assets…</div>
      ) : assets.length === 0 ? (
        <div className="text-slate-500 text-sm">No assets yet — upload one above.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assets.map((a) => {
            const Icon = TYPE_ICON[a.type] || ImageIcon;
            return (
              <div key={a._id} className="rounded-2xl border border-amber-500/15 bg-white/[0.02] p-3 flex items-center gap-3">
                {a.type === "background" ? (
                  <img src={a.url} alt={a.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.category} · {a.downloadCount} downloads
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    onClick={() => togglePublish(a)}
                    title={a.isPublished ? "Unpublish" : "Publish"}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    {a.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(a._id)}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAssets;
