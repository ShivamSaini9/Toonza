import {
  Download,
  History,
  Loader2,
  Mic,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const voiceOptions = [
  { value: "en-US-female", language: "en-US", label: "Aria · English female" },
  { value: "en-US-male", language: "en-US", label: "Guy · English male" },
  { value: "hi-IN-female", language: "hi-IN", label: "Swara · Hindi female" },
  { value: "hi-IN-male", language: "hi-IN", label: "Madhur · Hindi male" },
  {
    value: "es-ES-female",
    language: "es-ES",
    label: "Elvira · Spanish female",
  },
  { value: "es-ES-male", language: "es-ES", label: "Alvaro · Spanish male" },
  { value: "fr-FR-female", language: "fr-FR", label: "Denise · French female" },
  { value: "fr-FR-male", language: "fr-FR", label: "Henri · French male" },
  { value: "de-DE-female", language: "de-DE", label: "Katja · German female" },
  { value: "de-DE-male", language: "de-DE", label: "Conrad · German male" },
  {
    value: "ja-JP-female",
    language: "ja-JP",
    label: "Nanami · Japanese female",
  },
  { value: "ja-JP-male", language: "ja-JP", label: "Keita · Japanese male" },
];

const languageOptions = [
  { value: "en-US", label: "English (US)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
];

const styleOptions = [
  { value: "default", label: "Default" },
  { value: "calm", label: "Calm · slower pace" },
  { value: "energetic", label: "Energetic · brighter delivery" },
  { value: "story", label: "Story · gentle narration" },
];

const formatRelativeTime = (dateValue) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000),
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const downloadAudio = async (audioUrl, fileName) => {
  const response = await fetch(audioUrl);
  if (!response.ok) throw new Error("Audio download failed");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

const HistorySkeleton = () => (
  <div className="animate-pulse space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
    <div className="h-4 w-3/4 rounded bg-slate-800" />
    <div className="h-3 w-1/3 rounded bg-slate-800" />
    <div className="h-9 rounded bg-slate-800" />
  </div>
);

const VoiceCard = ({ generation, onDelete }) => {
  const voiceLabel =
    voiceOptions.find((option) => option.value === generation.voice)?.label ??
    generation.voice;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-slate-200">
          {generation.text}
        </p>
        <span className="shrink-0 text-xs text-slate-500">
          {formatRelativeTime(generation.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
          {voiceLabel}
        </span>
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 capitalize text-violet-300">
          {generation.style}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <audio
          controls
          preload="none"
          src={generation.audioUrl}
          className="h-9 min-w-0 flex-1"
        />
        <button
          type="button"
          title="Download voice"
          aria-label="Download voice"
          onClick={() =>
            downloadAudio(
              generation.audioUrl,
              `toonza-voice-${generation._id}.mp3`,
            ).catch(() => toast.error("Could not download this voice"))
          }
          className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
        >
          <Download size={16} />
        </button>
        <button
          type="button"
          title="Delete voice"
          aria-label="Delete voice"
          onClick={() => onDelete(generation._id)}
          className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/50 hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
};

const VoiceGeneration = () => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("en-US-female");
  const [style, setStyle] = useState("default");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const { credits, setCredits } = useAuth();
  const availableVoices = voiceOptions.filter(
    (option) => option.language === language,
  );

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    setVoice(
      voiceOptions.find((option) => option.language === nextLanguage)?.value ??
        "en-US-female",
    );
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/v1/voice/history", {
          params: { page: 1, limit: 10 },
        });
        setHistory(response.data?.data?.generations ?? []);
      } catch (error) {
        console.error("Voice history failed:", error);
        toast.error("Could not load previously generated voices");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Enter some text first");
      return;
    }
    if (text.length > 5000) {
      toast.error("Text must be 5000 characters or fewer");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/voice/generate-voice", {
        text,
        voice,
        style,
      });
      const generation = response.data?.data;
      if (!generation?.audioUrl) throw new Error("No audio URL returned");

      setLatest(generation);
      setHistory((current) => [generation, ...current]);
      setCredits((current) => Math.max(0, current - 1));
      toast.success("Voice generated");
    } catch (error) {
      console.error("Voice generation failed:", error);
      toast.error(
        error.response?.data?.message || "Voice generation failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/voice/history/${id}`);
      setHistory((current) => current.filter((item) => item._id !== id));
      setLatest((current) => (current?._id === id ? null : current));
      toast.success("Voice removed from history");
    } catch (error) {
      console.error("Voice deletion failed:", error);
      toast.error(
        error.response?.data?.message || "Could not delete this voice",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Mic className="text-cyan-400" /> Text to Voice
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Turn scripts and dialogue into downloadable narration with Edge
              TTS.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 sm:self-auto">
            <Sparkles size={16} className="text-cyan-400" /> {credits} credits ·
            1 per voice
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create a voice</h2>
              <span className="text-xs text-slate-500">Multiple languages</span>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={5000}
              placeholder="Paste a story beat, character dialogue, or narration here..."
              className="min-h-56 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-white placeholder-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
            <div className="mt-2 text-right text-xs text-slate-500">
              {text.length}/5000
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-400">
                <span>Language</span>
                <select
                  value={language}
                  onChange={(event) => handleLanguageChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-500/60"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-400">
                <span>Voice</span>
                <select
                  value={voice}
                  onChange={(event) => setVoice(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-500/60"
                >
                  {availableVoices.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-400">
                <span>Delivery style</span>
                <select
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-500/60"
                >
                  {styleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-700 px-4 py-3 font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Generating
                  voice...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate voice · 1 credit
                </>
              )}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Latest generation</h2>
              <span className="text-xs text-slate-500">MP3 audio</span>
            </div>
            {latest ? (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                <p className="line-clamp-4 text-sm leading-6 text-slate-200">
                  {latest.text}
                </p>
                <audio
                  controls
                  autoPlay
                  src={latest.audioUrl}
                  className="mt-5 h-10 w-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    downloadAudio(
                      latest.audioUrl,
                      `toonza-voice-${latest._id}.mp3`,
                    ).catch(() => toast.error("Could not download this voice"))
                  }
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
                >
                  <Download size={16} /> Download MP3
                </button>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                <Mic size={30} className="mb-3 text-slate-700" />
                <p>Your generated voice will appear here.</p>
                <p className="mt-1 text-xs">
                  Create a clip to preview and download it.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <History className="text-violet-400" />
            <div>
              <h2 className="text-lg font-semibold">Previously Generated</h2>
              <p className="text-xs text-slate-500">Your latest voice clips</p>
            </div>
          </div>
          <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
            {historyLoading ? (
              <>
                <HistorySkeleton />
                <HistorySkeleton />
                <HistorySkeleton />
              </>
            ) : history.length ? (
              history.map((generation) => (
                <VoiceCard
                  key={generation._id}
                  generation={generation}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500">
                <Mic size={28} className="mx-auto mb-3 text-slate-700" />
                <p>No voices generated yet</p>
                <p className="mt-1 text-xs">
                  Your generated clips will be saved here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VoiceGeneration;
