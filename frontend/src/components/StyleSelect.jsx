import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const styles = [
  "Auto",
  "Realistic",
  "Anime",
  "Cartoon",
  "Illustration",
  "Storybook",
];

const ratios = ["1:1", "4:5", "16:9", "3:4"];

const counts = [1, 2, 3, 4];

export default function StyleSelect({ name, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  if (name === "styles") {
    name = styles;
  } else if (name === "ratios") {
    name = ratios;
  } else {
    name = counts;
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between
          rounded-xl px-4 py-2.5
          bg-black/40 backdrop-blur
          border border-white/10
          text-sm text-white
          hover:border-violet-500/50
          transition
        "
      >
        <span className={value ? "text-white" : "text-slate-400"}>
          {value || "Style"}
        </span>
        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            exit={{ opacity: 0, y: -6 }}
            className="
              absolute z-50 mt-2 w-full overflow-hidden
              rounded-xl
              bg-black backdrop-blur-xl
              border border-white/10
              shadow-xl shadow-black/40
            "
          >
            {name.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
                className="
                  w-full px-4 py-2.5 text-left text-sm
                  text-slate-200 hover:bg-violet-500/10
                  transition
                "
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
