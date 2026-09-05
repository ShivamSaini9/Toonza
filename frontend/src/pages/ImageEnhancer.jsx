import { useState } from "react";
import { Upload, Sparkles, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";

/* ----------------------- Animated Placeholder ----------------------- */
// const EnhancingPlaceholder = () => {
//   return (
//     <div className="w-full h-72 rounded-xl relative overflow-hidden bg-slate-800 border border-slate-700">
//       {/* Shimmer */}
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

//       {/* Glow */}
//       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 animate-pulse" />

//       {/* Center content */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <Sparkles className="w-10 h-10 text-violet-400 animate-bounce mb-3" />
//         <p className="text-slate-300 font-medium animate-pulse">
//           Enhancing with AI…
//         </p>
//       </div>
//     </div>
//   );
// };

/* ------------------------ Main Component ------------------------ */
const ImageEnhancer = () => {
  const [file, setFile] = useState(null); // store actual File
  const [preview, setPreview] = useState(null); // local preview
  const [enhanced, setEnhanced] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setCredits } = useAuth();

  /* ------------------------ File Upload ------------------------ */
  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile)); // preview only
    setEnhanced(null); // reset previous enhanced
  };

  /* ------------------------ Enhance Image ------------------------ */
  const enhanceImage = async () => {
    if (!file) return toast.error("Please upload an image first.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file); // Multer expects key 'image'

      const res = await api.post(
        "/api/v1/imageEnhancer/enhance-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (res.data?.image) {
        setEnhanced(res.data.image); // backend URL
        setCredits((prev) => prev - 1); // deduct credit
      }
    } catch (err) {
      console.error("Enhancement failed:", err);
      toast.error("Image enhancement failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------ Download Image ------------------------ */
  const handleDownload = async (url) => {
    if (!url) return;
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "enhanced-image.png";
    a.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="text-indigo-400" /> AI Image Enhancer
        </h1>
        <p className="text-slate-400 mb-8">
          Upscale, sharpen, and enhance images using AI
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ------------------------ Upload Card ------------------------ */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 cursor-pointer hover:border-violet-500 transition">
              <Upload className="w-8 h-8 mb-2 text-slate-400" />
              <span className="text-slate-400">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleUpload}
              />
            </label>

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="rounded-xl max-h-72 object-contain mx-auto shadow-inner"
              />
            )}

            <button
              onClick={enhanceImage}
              disabled={!preview || loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-cyan-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Enhancing..." : "Enhance Image"}
            </button>
          </div>

          {/* ------------------------ Result Card ------------------------ */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            {loading ? (
              <AnimatedPlaceholder text="Enhancing Image…" />
            ) : enhanced ? (
              <div className="flex flex-col items-center">
                <img
                  src={enhanced}
                  alt="enhanced"
                  className="rounded-xl max-h-72 object-contain mb-4 shadow-2xl"
                />
                <button
                  onClick={() => handleDownload(enhanced)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-500 text-center">
                Enhanced image will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEnhancer;
