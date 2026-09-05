import { useState } from "react";
import { Wand2, Copy, Download, FileDown, User2 } from "lucide-react";
import toast from "react-hot-toast";
import { dialogueApi } from "../api/admin";

const CHARACTER_COLORS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
];

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const getWordCount = (text) => {
  const trimmedText = text.trim();
  return trimmedText ? trimmedText.split(/\s+/).length : 0;
};

const formatDuration = (wordCount) => {
  if (!wordCount) return "0 min";

  const totalSeconds = Math.round((wordCount / 200) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (!minutes) return `${seconds} sec`;
  if (!seconds) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
};

const DialogueSeparator = () => {
  const [script, setScript] = useState("");
  const [characters, setCharacters] = useState(null);
  const [loading, setLoading] = useState(false);
  const wordCount = getWordCount(script);

  const separate = async () => {
    if (script.trim().length < 5) {
      toast.error("Paste a script with a few lines first.");
      return;
    }
    setLoading(true);
    try {
      const res = await dialogueApi.separate(script);
      setCharacters(res.data.data.characters);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to separate dialogue",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCharacter = (character, lines) => {
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success(`Copied ${character}'s lines`);
  };

  const downloadCharacter = (character, lines) => {
    downloadText(`${character.replace(/\s+/g, "_")}.txt`, lines.join("\n"));
  };

  const downloadAll = () => {
    if (!characters) return;
    const text = characters
      .map((c) => `=== ${c.character} ===\n${c.lines.join("\n")}`)
      .join("\n\n");
    downloadText("dialogue-separated.txt", text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
        <Wand2 className="text-violet-400" /> Dialogue Separator
      </h1>
      <p className="text-slate-400 mb-6">
        Paste your script and instantly split it into per-character dialogue
        blocks — ready to hand to your voice actors.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <label className="text-sm text-slate-400 mb-2">
            Paste script (e.g.{" "}
            <code className="text-slate-300">Neha: Where are you going?</code>)
          </label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={16}
            placeholder={
              "Neha: Where are you going?\nKaran: Just for a walk.\nNarrator: The sun was setting over the city."
            }
            className="flex-1 resize-none rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Story length
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {wordCount.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-500">
                  words
                </span>
              </p>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Estimated video
              </p>
              <p className="mt-1 text-lg font-semibold text-cyan-300">
                {formatDuration(wordCount)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Approx. 200 spoken words per minute
          </p>
          <button
            onClick={separate}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Separating…" : "Separate Dialogue"}
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          {!characters ? (
            <div className="h-full min-h-[300px] flex items-center justify-center text-slate-500 text-center px-6">
              Character-wise dialogue will appear here once you separate a
              script.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">
                  {characters.length} character
                  {characters.length > 1 ? "s" : ""} found
                </h2>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download All
                </button>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {characters.map((c, i) => (
                  <div
                    key={c.character}
                    className="rounded-xl border border-slate-800 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-2 flex items-center justify-between bg-gradient-to-r ${
                        CHARACTER_COLORS[i % CHARACTER_COLORS.length]
                      } bg-opacity-10`}
                    >
                      <div className="flex items-center gap-2 text-white font-medium">
                        <User2 className="w-4 h-4" />
                        {c.character}
                        <span className="text-xs text-white/70">
                          ({c.lineCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyCharacter(c.character, c.lines)}
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white/90"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            downloadCharacter(c.character, c.lines)
                          }
                          className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white/90"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <ul className="bg-slate-950/60 divide-y divide-slate-800">
                      {c.lines.map((line, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 text-sm text-slate-300"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogueSeparator;
