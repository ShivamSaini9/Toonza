import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Download,
  Image as ImageIcon,
  Music2,
  Volume2,
  Play,
  Pause,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { assetLibraryApi } from "../api/admin";

const TABS = [
  { value: "background", label: "Backgrounds", icon: ImageIcon },
  { value: "bgm", label: "BGM", icon: Music2 },
  { value: "sfx", label: "SFX", icon: Volume2 },
];

const AssetLibrary = () => {
  const [tab, setTab] = useState("background");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assetLibraryApi.list({
        type: tab,
        search: search || undefined,
        category: category || undefined,
        limit: 40,
      });
      setAssets(res.data.data.assets);
      setCategories(res.data.data.categories);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [tab, search, category]);

  useEffect(() => {
    const t = setTimeout(fetchAssets, 250);
    return () => clearTimeout(t);
  }, [fetchAssets]);

  useEffect(() => {
    setCategory(""); // reset category filter when switching tabs
  }, [tab]);

  useEffect(() => {
    const closePreview = (event) => {
      if (event.key === "Escape") setPreviewAsset(null);
    };
    window.addEventListener("keydown", closePreview);
    return () => window.removeEventListener("keydown", closePreview);
  }, []);

  const handleDownload = async (asset) => {
    try {
      await assetLibraryApi.download(asset._id);
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = asset.title;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  const togglePlay = (asset) => {
    setPlayingId((prev) => (prev === asset._id ? null : asset._id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
        Asset Library
      </h1>
      <p className="text-slate-400 mb-6">
        Free backgrounds, BGM, and sound effects for your projects.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border transition ${
              tab === t.value
                ? "bg-white/10 border-violet-500/40 text-white"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + category */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="[color-scheme:dark] px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500/40"
          >
            <option value="" className="bg-slate-900 text-white">
              All categories
            </option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : assets.length === 0 ? (
        <div className="text-slate-500 text-sm">
          No assets found for this filter yet.
        </div>
      ) : tab === "background" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden group"
            >
              <button
                type="button"
                onClick={() => setPreviewAsset(a)}
                className="block aspect-video w-full cursor-zoom-in bg-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
                title={`View ${a.title}`}
              >
                <img
                  src={a.url}
                  alt={a.title}
                  className="h-full w-full object-contain bg-slate-950 transition group-hover:scale-[1.02]"
                />
              </button>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.category}</p>
                </div>
                <button
                  onClick={() => handleDownload(a)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 shrink-0"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <button
                onClick={() => togglePlay(a)}
                className="p-2 rounded-full bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 shrink-0"
              >
                {playingId === a._id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{a.title}</p>
                <p className="text-xs text-slate-500">{a.category}</p>
                {playingId === a._id && (
                  <audio
                    src={a.url}
                    autoPlay
                    onEnded={() => setPlayingId(null)}
                    className="w-full mt-2 h-8"
                    controls
                  />
                )}
              </div>
              <button
                onClick={() => handleDownload(a)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 shrink-0"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previewAsset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${previewAsset.title} preview`}
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl sm:max-h-[calc(100vh-4rem)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {previewAsset.title}
                </p>
                <p className="text-xs text-slate-500">
                  {previewAsset.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title="Close preview"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 items-center justify-center bg-black p-3 sm:p-6">
              <img
                src={previewAsset.url}
                alt={previewAsset.title}
                className="max-h-[calc(100vh-10rem)] max-w-full object-contain sm:max-h-[calc(100vh-12rem)]"
              />
            </div>
            <div className="flex justify-end border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={() => handleDownload(previewAsset)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-700 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLibrary;
