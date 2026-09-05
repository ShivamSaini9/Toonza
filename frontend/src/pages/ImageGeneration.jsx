import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GeneratedImage from "../components/GeneratedImage";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { nanoid } from "nanoid";
import StyleSelect from "../components/StyleSelect";

const ImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [imageGroup, setImageGroup] = useState([]);
  const [isPublic, setIsPublic] = useState(false);

  const [formData, setFormData] = useState({
    prompt: "",
    style: "",
    ratio: "1:1",
    count: 1,
  });

  const { user, setCredits } = useAuth();

  // Load previously generated images
  useEffect(() => {
    if (!user?._id) return;

    const getImages = async () => {
      setLoading(true);

      try {
        const res = await api.get("/api/v1/imageGroup/get-imageGroup");
        setImageGroup(res.data.data || []);
      } catch {
        toast.error("Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    getImages();
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.prompt) {
      return toast.error("Prompt is required!");
    }

    try {
      setLoading(true);

      // Temporary image shown while BullMQ worker processes the job
      const optimisticImage = {
        tempId: nanoid(),
        url: "/samplee.jpg",
        optimistic: true,
        createdAt: new Date().toISOString(),
      };

      // Add temporary image to today's group
      setImageGroup((prev = []) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStr = today.toISOString().split("T")[0];

        const groupExists = prev.some(
          (g) => g?.date?.split("T")[0] === todayStr,
        );

        if (groupExists) {
          return prev.map((g) =>
            g?.date?.split("T")[0] === todayStr
              ? {
                  ...g,
                  images: [optimisticImage, ...(g.images || [])],
                }
              : g,
          );
        }

        return [
          {
            _id: "tempGroupId",
            date: new Date(),
            images: [optimisticImage],
          },
          ...prev,
        ];
      });

      // Add image-generation job to BullMQ
      const response = await api.post("/api/v1/imageGroup/generate-image", {
        ...formData,
        isPublic,
      });

      console.log("Queue response:", response.data);

      toast.success("Image generation started!");

      /*
       * Worker processes the image in the background.
       * We poll the job status until it's completed or failed.
       */
      const jobId = response.data.data.jobId;

      const checkJobStatus = async () => {
        try {
          const statusResponse = await api.get(
            `/api/v1/imageGroup/job-status/${jobId}`,
          );

          const job = statusResponse.data.data;

          console.log("Job status:", job);

          if (job.status === "completed") {
            const res = await api.get("/api/v1/imageGroup/get-imageGroup");

            setImageGroup(res.data.data || []);
            setLoading(false); // NEW
            toast.success("Image generated successfully!");

            // Stop polling
            return;
          }

          if (job.status === "failed") {
            setLoading(false); // NEW
            toast.error(job.error || "Image generation failed");

            return;
          }

          // Still waiting/processing
          setTimeout(checkJobStatus, 2000);
        } catch (error) {
          console.error("Job status check failed:", error);
          setLoading(false); // NEW
          toast.error("Failed to check image generation status.");
        }
      };

      checkJobStatus();
    } catch (error) {
      // Remove optimistic image if queue request itself fails
      setImageGroup((prev = []) =>
        prev
          .map((g) => ({
            ...g,
            images: (g.images || []).filter((i) => !i.optimistic),
          }))
          .filter((g) => g.images.length),
      );

      toast.error(error.response?.data?.message || "Image generation failed");
    }
  };

  return (
    <div className="space-y-10 relative">
      {/* Prompt Card */}
      <motion.form
        onSubmit={handleSubmit}
        className="
          backdrop-blur-xl
          border border-white/10
          rounded-2xl p-6 space-y-5
        "
      >
        <textarea
          value={formData.prompt}
          onChange={(e) =>
            setFormData({
              ...formData,
              prompt: e.target.value,
            })
          }
          placeholder="A futuristic city at night with neon lights..."
          className="
            w-full h-32 rounded-xl
            bg-black/40 border border-white/10
            p-4 text-white placeholder-slate-500
            resize-none focus:outline-none
            focus:ring-1 focus:ring-cyan-400
          "
        />

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StyleSelect
            name="styles"
            value={formData.style}
            disabled={loading}
            onChange={(val) =>
              setFormData({
                ...formData,
                style: val,
              })
            }
          />

          <StyleSelect
            name="ratios"
            value={formData.ratio}
            disabled={loading}
            onChange={(val) =>
              setFormData({
                ...formData,
                ratio: val,
              })
            }
          />

          <StyleSelect
            value={formData.count}
            disabled={loading}
            onChange={(val) =>
              setFormData({
                ...formData,
                count: val,
              })
            }
          />
        </div>

        {/* Public Toggle */}
        <div
          className="
            flex items-center justify-between
            bg-black/40 border border-white/10
            rounded-xl px-4 py-3
          "
        >
          <span className="text-sm text-slate-300">
            Public (Visible to everyone)
          </span>

          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`h-6 w-11 rounded-full transition ${
              isPublic
                ? "bg-gradient-to-r from-cyan-600 to-violet-700"
                : "bg-slate-600"
            }`}
          >
            <span
              className={`block h-4 w-4 bg-white rounded-full transition-transform ${
                isPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          type="submit"
          className="
            w-full flex items-center justify-center gap-2
            py-3 rounded-xl font-medium
            bg-gradient-to-r from-violet-600 to-cyan-700
            text-white disabled:opacity-60
          "
        >
          <Sparkles size={18} />

          {loading ? "Generating..." : "Generate Image"}
        </motion.button>
      </motion.form>

      {/* Results */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Generated Images
        </h2>

        <GeneratedImage imageGroup={imageGroup} loading={loading} />
      </div>
    </div>
  );
};

export default ImageGeneration;
