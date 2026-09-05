import { Sparkles } from "lucide-react";

const AnimatedPlaceholder = ({ text }) => {
  return (
    <div className="w-full h-full rounded-xl relative overflow-hidden bg-slate-800 border border-slate-700">
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 animate-pulse" />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Sparkles className="w-10 h-10 text-violet-400 animate-bounce mb-3" />
        <p className="text-slate-300 font-medium animate-pulse">{text}</p>
      </div>
    </div>
  );
};

export default AnimatedPlaceholder;
