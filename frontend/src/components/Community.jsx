import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { Download } from "lucide-react";

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const publicImages = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/imageGroup/get-publicImages");

        if (!res.data) throw new error("failed to fetch public images");
        console.log("imagespublic:", res.data);
        setCreations(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    publicImages();
  }, []);

  const handleDownload = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "generated-image.png";
    a.click();

    URL.revokeObjectURL(objectUrl);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ scale: 1.02 }}
            className="relative rounded-2xl overflow-hidden border border-slate-800 group"
          >
            <img
              src={item.url}
              onClick={() =>
                setPreviewImage({
                  url: item.url,
                  prompt: item.prompt,
                })
              }
              alt={item.prompt}
              className="h-72 w-full object-cover cursor-pointer"
            />

            {/* Top user info */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                {/* {item.user[0]} */}
                <img src={item.uploadedBy.avatar} />
              </div>
              <span>{item.uploadedBy.fullName}</span>
            </div>

            {/* Prompt overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-sm text-slate-200 translate-y-full group-hover:translate-y-0 transition  ">
              <p className="line-clamp-3 ">{item.prompt}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full h-full flex flex-col"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* TOP BAR */}
              <div className="h-16 flex items-center justify-between px-6 bg-black/60 backdrop-blur-md border-b border-white/10">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition"
                >
                  ✕ <span className="hidden sm:inline">Close</span>
                </button>

                <button
                  onClick={() => handleDownload(previewImage.url)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>

              {/* IMAGE AREA */}
              <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={previewImage.url}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                  alt="Preview"
                />
              </div>

              {/* PROMPT */}
              {previewImage.prompt && (
                <div className="max-w-5xl mx-auto w-full px-6 pb-6">
                  <div className="bg-black/60 backdrop-blur-md text-slate-200 p-4 rounded-xl text-sm">
                    {previewImage.prompt}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Community;
