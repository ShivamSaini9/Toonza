import { Download, Copy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const GeneratedImage = ({ imageGroup = [], loading }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

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

  const handleCopyPrompt = async (prompt) => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {imageGroup.length > 0 ? (
        imageGroup.map((item, idx) => (
          <div key={idx} className="flex flex-col mb-6">
            <p className="text-sm text-slate-400 mb-3 mt-8">
              {formatDate(item.date)}
            </p>

            {/* GRID */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-3 gap-4">
              {item.images.map((img) => (
                <div
                  key={img._id ?? img.tempId}
                  className="relative group aspect-square rounded-xl overflow-hidden"
                >
                  {/* IMAGE */}
                  <motion.img
                    src={img.url}
                    onClick={() =>
                      !img.optimistic &&
                      setPreviewImage({
                        url: img.url,
                        prompt: img.prompt,
                      })
                    }
                    onLoad={() =>
                      setLoadedImages((prev) => ({
                        ...prev,
                        [img._id ?? img.tempId]: true,
                      }))
                    }
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      filter: "blur(10px)",
                    }}
                    animate={
                      loadedImages[img._id ?? img.tempId]
                        ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                        : {}
                    }
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full object-cover cursor-pointer"
                  />

                  {/* LOADING OVERLAY */}
                  {img.optimistic && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                      <AnimatedPlaceholder text="Generating image…" />
                      {/* <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                      <p className="text-sm text-white animate-pulse">
                        Generating image…
                      </p> */}
                    </div>
                  )}

                  {/* ACTIONS */}
                  {!img.optimistic && (
                    <>
                      <button
                        onClick={() => handleDownload(img.url)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/60 hover:bg-black/80 p-2 rounded-lg"
                      >
                        <Download size={16} className="text-white" />
                      </button>

                      {/* PROMPT OVERLAY */}
                      <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition">
                        <div className="relative bg-black/70 p-3 text-sm text-slate-200">
                          <p className="line-clamp-3 pr-20 translate-y-full group-hover:translate-y-0 transition">
                            {img.prompt}
                          </p>

                          <div className="absolute bottom-2 right-2 flex gap-2">
                            <IconButton
                              onClick={() => handleCopyPrompt(img.prompt)}
                            >
                              <Copy size={14} />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                console.log("Reuse prompt:", img.prompt)
                              }
                            >
                              <RotateCcw size={14} />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">
              Your creative space is empty
            </h2>
            <p className="text-slate-400">
              Describe your idea and let AI turn it into stunning images.
            </p>
          </div>
        </div>
      )}

      {/* FULL IMAGE MODAL */}
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

const IconButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-black/60 hover:bg-black/80 p-2 rounded-md text-white transition"
  >
    {children}
  </button>
);

export default GeneratedImage;
